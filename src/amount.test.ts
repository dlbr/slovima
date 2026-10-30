import { describe, expect, it } from 'vitest'
import { convertAmount } from './amount'
const text = (s: string) => { const r = convertAmount(s); return r.ok ? r.text : 'error' }
describe('Iznos u reči', () => {
 it.each([['0','nula dinara'],['1','jedan dinar'],['2','dva dinara'],['21','dvadeset jedan dinar'],['101','sto jedan dinar'],['11','jedanaest dinara'],['0,01','jedna para'],['0,02','dve pare'],['0,11','jedanaest para'],['1,01','jedan dinar i jedna para'],['1000','hiljadu dinara'],['2000','dve hiljade dinara'],['21000','dvadeset jedna hiljada dinara'],['1000000','jedan milion dinara'],['1000000000','jedna milijarda dinara'],['1000000000000','jedan bilion dinara']])('%s → %s', (n, expected) => expect(text(n)).toBe(expected))
 it.each([['0,004','nula dinara'],['0,005','jedna para'],['0,995','jedan dinar'],['99,995','sto dinara'],['10.800,125','deset hiljada osamsto dinara i trinaest para'],['0001,5','jedan dinar i pedeset para']])('rounds %s', (n, expected) => expect(text(n)).toBe(expected))
 it.each(['','abc','10.800,abc','1,','1,2,3','-1','+1','1e3','Infinity','12 000','NaN', '1000000000000000','999.999.999.999.999,995','1'.repeat(101)])('rejects %s', n => expect(convertAmount(n).ok).toBe(false))
 it.each([['10000.20', 'deset hiljada dinara i dvadeset para'], ['1.2', 'jedan dinar i dvadeset para'], ['10.800', 'deset hiljada osamsto dinara'], ['10000.995', 'deset hiljada jedan dinar']])('supports decimal dots and grouped amounts: %s', (value, expected) => expect(text(value)).toBe(expected))
 it('formats and compacts without losing diacritics', () => expect(convertAmount(' 10.800,50 ')).toEqual({ok:true,text:'deset hiljada osamsto dinara i pedeset para',compact:'desethiljadaosamstodinaraipedesetpara',normalized:'10.800,50'}))
 it('handles every para value and a broad range without exceptions', () => { for(let i=0;i<10000;i++) expect(convertAmount(`${i},${String(i%100).padStart(2,'0')}`).ok).toBe(true) })
})
