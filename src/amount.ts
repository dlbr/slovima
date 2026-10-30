const ones = ['', 'jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet']
const tens = ['', '', 'dvadeset', 'trideset', 'četrdeset', 'pedeset', 'šezdeset', 'sedamdeset', 'osamdeset', 'devedeset']
const teens = ['deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'šesnaest', 'sedamnaest', 'osamnaest', 'devetnaest']
const hundreds = ['', 'sto', 'dvesta', 'trista', 'četiristo', 'petsto', 'šeststo', 'sedamsto', 'osamsto', 'devetsto']
const forms = [['', '', ''], ['hiljada', 'hiljade', 'hiljada'], ['milion', 'miliona', 'miliona'], ['milijarda', 'milijarde', 'milijardi'], ['bilion', 'biliona', 'biliona']]
function form(n: number) { return n % 100 >= 11 && n % 100 <= 14 ? 2 : n % 10 === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 ? 1 : 2 }
function three(n: number, feminine = false): string[] {
 const words: string[] = []
 if (n >= 100) words.push(hundreds[Math.floor(n / 100)]!)
 n %= 100
 if (n >= 10 && n < 20) words.push(teens[n - 10]!)
 else { if (n >= 20) words.push(tens[Math.floor(n / 10)]!); const u = n % 10; if (u) words.push(feminine && u === 1 ? 'jedna' : feminine && u === 2 ? 'dve' : ones[u]!) }
 return words
}
function words(n: bigint): string[] {
 if (n === 0n) return ['nula']
 const chunks: string[][] = []; let i = 0
 while (n > 0n) { const c = Number(n % 1000n); if (c) { const part = three(c, i === 1 || i === 3); if (i === 1 && c === 1) part.splice(0, part.length, 'hiljadu'); else if (i) part.push(forms[i]![form(c)]!); chunks.unshift(part) } n /= 1000n; i++ }
 return chunks.flat()
}
export type AmountResult = { ok: true; text: string; compact: string; normalized: string } | { ok: false; error: string }
export function convertAmount(input: string): AmountResult {
 const value = input.trim()
 if (!value) return { ok: false, error: 'Unesite iznos.' }
 if (value.length > 100) return { ok: false, error: 'Unos je predugačak.' }
 const dotDecimal = /^\d+\.\d+$/.test(value) && !/^\d{1,3}\.\d{3}$/.test(value)
 const serbian = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value)
 if (!dotDecimal && !serbian) return { ok: false, error: 'Unesite iznos kao 10.800,50 ili 10000.20.' }
 const [integer, fraction = ''] = (dotDecimal ? value.replace('.', ',') : value).split(',') as [string, string?]
 const digits = integer.replaceAll('.', '').replace(/^0+(?=\d)/, '')
 if (digits.length > 15) return { ok: false, error: 'Najveći podržani iznos je 999.999.999.999.999,99 dinara.' }
 let cents = BigInt(digits) * 100n + BigInt((fraction + '00').slice(0, 2))
 if ((fraction[2] ?? '0') >= '5') cents++
 if (cents > 99999999999999999n) return { ok: false, error: 'Zaokruženi iznos prelazi podržanu granicu.' }
 const dinars = cents / 100n; const para = Number(cents % 100n); const parts: string[] = []
 if (dinars > 0n || para === 0) { const n = Number(dinars); parts.push(...words(dinars), form(n) === 0 ? 'dinar' : 'dinara') }
 if (para) { if (parts.length) parts.push('i'); parts.push(...three(para, true), form(para) === 0 ? 'para' : form(para) === 1 ? 'pare' : 'para') }
 const text = parts.join(' ')
 return { ok: true, text, compact: parts.join(''), normalized: `${dinars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${String(para).padStart(2, '0')}` }
}
