import { convertAmount } from './amount'

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
const json = (body: object, status = 200, extra: Record<string, string> = {}) => Response.json(body, { status, headers: { ...headers, ...extra } })

export default {
 async fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
  if (url.pathname !== '/api/v1/convert') return json({ error: 'Nepoznata API putanja.' }, 404)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'GET') return json({ error: 'Dozvoljen je samo GET.' }, 405, { Allow: 'GET, OPTIONS' })
  const ip = request.headers.get('CF-Connecting-IP')
  if (!ip) return json({ error: 'Nije moguće utvrditi adresu klijenta.' }, 503)
  try {
   const { success } = await env.RATE_LIMITER.limit({ key: `slovima-api:${ip}` })
   if (!success) return json({ error: 'Previše zahteva. Pokušajte ponovo kasnije.' }, 429, { 'Retry-After': '60' })
  } catch { return json({ error: 'Provera ograničenja trenutno nije dostupna.' }, 503) }
  const values = url.searchParams.getAll('amount')
  if (values.length !== 1) return json({ error: 'Navedite tačno jedan parametar amount.' }, 400)
  const scripts = url.searchParams.getAll('script')
  if (scripts.length > 1 || (scripts.length && scripts[0] !== 'latn' && scripts[0] !== 'cyrl')) return json({ error: 'Parametar script mora biti latn ili cyrl.' }, 400)
  if (url.searchParams.has('space')) return json({ error: 'Parametar space više nije podržan; koristite polja text i compact.' }, 400)
  const result = convertAmount(values[0]!, scripts[0] === 'cyrl' ? 'cyrl' : 'latn')
  if (!result.ok) return json({ error: result.error }, 400)
  return json({ amount: result.normalized, currency: 'RSD', text: result.text, compact: result.compact })
 },
}
