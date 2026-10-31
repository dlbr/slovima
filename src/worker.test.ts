import { describe, expect, it, vi } from 'vitest'
import worker from './worker'
const limiter = vi.fn(async () => ({ success: true }))
const assets = vi.fn(async () => new Response('asset'))
const env = { RATE_LIMITER: { limit: limiter }, ASSETS: { fetch: assets } } as unknown as Env
const request = (path: string, method = 'GET', headers: Record<string,string> = { 'CF-Connecting-IP': '192.0.2.1' }) => new Request(`https://example.test${path}`, { method, headers })
describe('conversion API', () => {
 it('converts using the shared rules and private cache headers', async () => {
  limiter.mockResolvedValueOnce({success:true})
  const res = await worker.fetch(request('/api/v1/convert?amount=10000.20'), env)
  expect(res.status).toBe(200); expect(res.headers.get('cache-control')).toBe('no-store'); expect(res.headers.get('access-control-allow-origin')).toBe('*')
  expect(await res.json()).toEqual({ amount: '10.000,20', currency: 'RSD', text: 'deset hiljada dinara i dvadeset para', compact: 'desethiljadadinaraidvadesetpara' })
  expect(limiter).toHaveBeenCalledWith({key:'slovima-api:192.0.2.1'})
 })
 it.each(['/api/v1/convert', '/api/v1/convert?amount=abc', '/api/v1/convert?amount=0.005', '/api/v1/convert?amount=1&amount=2', '/api/v1/convert?amount=-1', '/api/v1/convert?amount=999999999999999999999'])('rejects invalid input %s', async path => { expect((await worker.fetch(request(path), env)).status).toBe(400) })
 it('supports both scripts and rejects invalid script parameters', async () => {
  const cyrl = await worker.fetch(request('/api/v1/convert?amount=1000&script=cyrl'), env)
  expect(await cyrl.json()).toMatchObject({ text: 'хиљаду динара', compact: 'хиљадудинара' })
  expect((await worker.fetch(request('/api/v1/convert?amount=1&script=latn'), env)).status).toBe(200)
  for (const query of ['script=other', 'script=', 'script=cyrl&script=latn']) expect((await worker.fetch(request('/api/v1/convert?amount=1&'+query), env)).status).toBe(400)
 })
 it('rejects removed space parameter rather than silently changing output', async () => {
  for (const value of ['true', 'false', '']) {
   const res = await worker.fetch(request(`/api/v1/convert?amount=1000&space=${value}`), env)
   expect(res.status).toBe(400); expect(await res.json()).toMatchObject({ error: expect.stringContaining('više nije podržan') })
  }
 })
 it('enforces the limit and fails closed when it is unavailable', async () => {
  limiter.mockResolvedValueOnce({success:false}); const blocked = await worker.fetch(request('/api/v1/convert?amount=1'),env)
  expect(blocked.status).toBe(429); expect(blocked.headers.get('retry-after')).toBe('60')
  limiter.mockRejectedValueOnce(new Error('unavailable')); expect((await worker.fetch(request('/api/v1/convert?amount=1'),env)).status).toBe(503)
  expect((await worker.fetch(request('/api/v1/convert?amount=1','GET',{}),env)).status).toBe(503)
 })
 it('handles methods, preflight, unknown routes and assets', async () => {
  expect((await worker.fetch(request('/api/v1/convert', 'POST'),env)).status).toBe(405)
  expect((await worker.fetch(request('/api/v1/convert', 'OPTIONS'),env)).status).toBe(204)
  expect((await worker.fetch(request('/api/missing'),env)).status).toBe(404)
  expect(await (await worker.fetch(request('/'),env)).text()).toBe('asset')
 })
})
