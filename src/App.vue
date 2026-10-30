<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { convertAmount } from './amount'
const amount = ref('10.800,50')
const compact = ref(false)
const notice = ref('')
const touched = ref(false)
const examples = ['0,01', '1.000,00', '10.800,50', '99,995']
const result = computed(() => convertAmount(amount.value))
const output = computed(() => result.value.ok ? (compact.value ? result.value.compact : result.value.text) : '')
async function copy() {
 if (!output.value) return
 try { await navigator.clipboard.writeText(output.value); notice.value = 'Kopirano u clipboard.' }
 catch { notice.value = 'Kopiranje nije dostupno. Označite tekst i kopirajte ga ručno.' }
}
</script>
<template>
 <div class="shell">
  <header><span class="header-note">Mali alat za velike iznose</span></header>
  <main>
   <div class="eyebrow"><span class="eyebrow-dot"></span> IZNOS SLOVIMA</div>
   <h1>Svaki dinar,<br><em>na svom mestu.</em></h1>
   <p class="intro">Pretvorite iznos u slovni zapis, spreman za fakture, ugovore i drugu dokumentaciju.</p>
   <section class="card" aria-label="Pretvaranje iznosa">
    <label for="amount">Iznos u dinarima</label>
    <div class="input-wrap"><input id="amount" v-model="amount" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" :aria-describedby="touched && !result.ok ? 'error' : undefined" :aria-invalid="touched && !result.ok" @input="notice = ''; touched = false" @blur="touched = true"><span>RSD</span></div>
    <p v-if="touched && !result.ok" id="error" class="error" role="alert">{{ result.error }}</p>
    <div class="examples"><span>ISPROBAJTE</span><button v-for="example in examples" :key="example" type="button" @click="amount = example; notice = ''">{{ example }}</button></div>
    <div class="divider"></div>
    <div class="result-head"><span>SLOVNI ZAPIS</span><label class="toggle"><input v-model="compact" type="checkbox" @change="notice = ''"> Bez razmaka</label></div>
    <div class="result" aria-live="polite">{{ output || 'Ovde će se prikazati slovni zapis.' }}</div>
    <div class="result-bottom"><span>{{ result.ok ? result.normalized + ' RSD' : 'Proverite unos' }}</span><button type="button" :disabled="!result.ok" @click="copy">Kopiraj zapis <span aria-hidden="true">↗</span></button></div>
    <p class="notice" aria-live="polite">{{ notice }}</p>
   </section>
   <section class="api-example" aria-labelledby="api-title">
    <div class="eyebrow">ZA PROGRAMERE</div><h2 id="api-title">Koristite API</h2>
    <p>Pošaljite iznos kao parametar <code>amount</code>. Odgovor je u JSON formatu.</p>
    <pre><code>curl 'https://slovima.dlbr.cloud/api/v1/convert?amount=10000.20'</code></pre>
    <p>Odgovor sadrži oba zapisa: <code>text</code> sa razmacima i <code>compact</code> bez razmaka.</p>
    <pre><code>{
  "amount": "10.000,20",
  "currency": "RSD",
  "text": "deset hiljada dinara i dvadeset para",
  "compact": "desethiljadadinaraidvadesetpara"
}</code></pre>
    <p>Do 60 zahteva u minuti po IP adresi, približno po Cloudflare lokaciji.</p>
   </section>
   <div class="footnote"><span>✳</span><p>Više od dve decimale zaokružujemo na najbližu paru. Iznosi se obrađuju samo u vašem pregledaču.</p></div>
  </main><footer><span>U PARU</span><span>Jednostavno, do poslednje pare.</span></footer>
 </div>
</template>
