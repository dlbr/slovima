# Slovima

Pretvorite iznos u dinarima u slovni zapis na srpskom jeziku. Aplikacija radi u pregledaču, a isti pretvarač dostupan je i kao javni API.

**[Otvori aplikaciju](https://slovima.dlbr.cloud)**

## Unos iznosa

Podržani su nenegativni iznosi do **999.999.999.999.999,99 RSD**. Unos može koristiti:

- Srpski zapis: `10.800,50` ili `10800,50`.
- Decimalnu tačku bez grupisanja hiljada: `10000.20`.

Dvosmisleni oblici poput `10.800` i `0.005` se odbijaju. Za hiljade koristite `10800` ili `10.800,00`, a za decimalni iznos `0,005`. Više od dve decimale zaokružuje se na najbližu paru; vrednost tačno na polovini zaokružuje se naviše. Proračun koristi celobrojnu aritmetiku radi preciznosti.

Rezultat je dostupan na latinici ili ćirilici, sa razmacima ili kao spojeni zapis. Unos u aplikaciji obrađuje se u pregledaču.

## API

```bash
curl 'https://slovima.dlbr.cloud/api/v1/convert?amount=10000.20&script=latn&space=true'
```

Odgovor:

```json
{
  "amount": "10.000,20",
  "currency": "RSD",
  "text": "deset hiljada dinara i dvadeset para",
  "compact": "desethiljadadinaraidvadesetpara"
}
```

Query parametri se u URL-u šalju kao tekst: `amount` je string, `script` je enum (`latn` ili `cyrl`), a `space` je boolean (`true` ili `false`).

Opcioni parametar `space=false` vraća `text` bez razmaka; `space=true` (podrazumevano) vraća ga sa razmacima. Polje `compact` uvek je bez razmaka. Opcioni parametar `script=cyrl` vraća ćirilični zapis; `script=latn` ili izostavljen parametar vraća latinicu. Parametar `amount` je obavezan i mora biti naveden tačno jednom. API vraća `400` za neispravan unos, `405` za nepodržanu metodu i `429` kada se prekorači limit. Kod odgovora `429` uključuje zaglavlje `Retry-After: 60`.

Limit je **60 zahteva u 60 sekundi po IP adresi**. Brojač je približan i zaseban po Cloudflare lokaciji, pa nije globalni strogi limit. API podržava CORS i vraća `Cache-Control: no-store`. Parametri u URL-u mogu se pojaviti u evidenciji servera ili posrednika.

## Lokalni razvoj

Potrebni su Node.js i npm. Instalirajte zavisnosti i pokrenite razvojni server:

```bash
npm ci
npm run dev
```

Aplikacija koristi Vue 3.6 Vapor, koji je u ovoj verziji *release candidate*. Vite razvojni server prikazuje stranicu; API se izvršava u Cloudflare Worker okruženju.

## Testiranje i build

```bash
npm test
npm run test:coverage
npx playwright install chromium
npm run test:e2e
npm run build
```

Coverage ima prag od 90% za linije, izraze, funkcije i grane. Obuhvata pretvarač, komponentu i Worker; početni `main.ts` obuhvaćen je E2E testovima pokretanja. Produkcioni statički fajlovi nalaze se u `dist/`.

## Deploy

Worker koristi konfiguraciju iz `wrangler.jsonc` i služi sadržaj iz `dist/`. Nakon prijavljivanja na Cloudflare nalog i podešavanja domena i rate-limit bindinga, objavite build pomoću Wrangler CLI-ja:

```bash
npm run build
npx wrangler deploy
```
