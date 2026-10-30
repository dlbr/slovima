# U paru

Samostalna statička Vue 3.6 Vapor aplikacija, zasnovana na gistu. `npm install`, `npm test`, `npm run build`; sadržaj `dist/` je spreman za statički hosting. Vue 3.6 je trenutno RC.

Unos podržava srpski format (tačka za hiljade, zarez za decimale) i decimalnu tačku bez grupisanja (10000.20). Dvosmislen oblik 10.800 tumači se kao grupisanje hiljada, nenegativni iznosi do 999.999.999.999.999,99 RSD; decimale se zaokružuju half-up na paru, bez floating-point greške. Neispravni i dvosmisleni unosi se odbijaju. Slovni zapis koristi srpska slova i pravilne oblike; opcija bez razmaka odgovara formi iz gista. Gist sadrži protivrečne očekivane rezultate i neispravnosti (npr. 0,150, 0,125 i neispravni sufiksi), ovde su ispravljeni.

Provere: `npm run test:coverage` (Vitest, prag 90% za linije, izraze, funkcije i grane) i `npm run test:e2e` (Playwright/Chromium; preglednik mora biti instaliran sa `npx playwright install chromium`). Coverage obuhvata konverziju i Vue komponentu, dok je početni `main.ts` koji samo pokreće aplikaciju izostavljen; pokretanje je obuhvaćeno E2E testovima.

API: `GET /api/v1/convert?amount=10000.20` vraća JSON `amount`, `currency`, `text`, `compact`. Jedan `amount` je obavezan; neispravan unos vraća 400, nedozvoljena metoda 405, a prekoračen limit 429 sa `Retry-After: 60`. API dozvoljava CORS i ne kešira odgovore. Limit je 60 zahteva po IP adresi u 60 sekundi, približan i zaseban po Cloudflare lokaciji. Cloudflare Rate Limiting nije globalni strogi brojač. Parametri u URL-u mogu biti vidljivi u server/proxy logovima.
