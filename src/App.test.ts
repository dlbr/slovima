// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVaporApp, nextTick } from 'vue'
import App from './App.vue'
let root: HTMLDivElement
let app: ReturnType<typeof createVaporApp>
const flush = async () => { await nextTick(); await Promise.resolve(); await nextTick() }
beforeEach(() => { root = document.createElement('div'); document.body.append(root); app = createVaporApp(App); app.mount(root) })
afterEach(() => { app.unmount(); root.remove(); vi.restoreAllMocks() })
describe('playground', () => {
 it('shows examples, validates on blur and switches compact output', async () => {
  const input = root.querySelector<HTMLInputElement>('#amount')!
  expect(root.querySelector('.result')!.textContent).toContain('deset hiljada')
  const example = [...root.querySelectorAll('button')].find(b => b.textContent === '99,995')!
  example.click(); await flush(); expect(root.querySelector('.result')!.textContent).toBe('sto dinara')
  const checkbox = root.querySelector<HTMLInputElement>('input[type=checkbox]')!; checkbox.click(); await flush()
  expect(root.querySelector('.result')!.textContent).toBe('stodinara')
  input.value = 'abc'; input.dispatchEvent(new Event('input')); await flush()
  expect(root.querySelector('[role=alert]')).toBeNull()
  input.dispatchEvent(new Event('blur')); await flush()
  expect(root.querySelector('[role=alert]')?.textContent).toContain('Unesite iznos')
  expect(root.querySelector<HTMLButtonElement>('.result-bottom button')!.disabled).toBe(true)
 })
 it('updates the example for Cyrillic and copies curl', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  root.querySelector<HTMLInputElement>('input[value=cyrl]')!.click(); await flush()
  expect(root.querySelector('.result')!.textContent).toContain('десет хиљада')
  const button = [...root.querySelectorAll('button')].find(b => b.textContent?.includes('Kopiraj curl'))!
  button.click(); await flush()
  expect(writeText.mock.calls[0]![0]).toContain('&script=cyrl')
  writeText.mockRejectedValueOnce(new Error('denied')); button.click(); await flush()
  expect(root.querySelector('.curl-notice')!.textContent).toContain('nije dostupno')
 })
 it('reports successful and failed copying', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  root.querySelector<HTMLButtonElement>('.result-bottom button')!.click(); await flush()
  expect(writeText).toHaveBeenCalledWith('deset hiljada osamsto dinara i pedeset para')
  expect(root.querySelector('.notice')!.textContent).toContain('Kopirano')
  writeText.mockRejectedValueOnce(new Error('denied'))
  root.querySelector<HTMLButtonElement>('.result-bottom button')!.click(); await flush()
  expect(root.querySelector('.notice')!.textContent).toContain('nije dostupno')
 })
})
