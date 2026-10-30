<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { convertAmount } from './amount'
const amount = ref('10.800,50')
const compact = ref(false)
const script = ref<'latn' | 'cyrl'>('latn')
const notice = ref('')
const curlNotice = ref('')
const touched = ref(false)
const examples = ['0,01', '1.000,00', '10.800,50', '99,995']
const result = computed(() => convertAmount(amount.value, script.value))
const curlCommand = computed(() => `curl 'https://slovima.dlbr.cloud/api/v1/convert?amount=${encodeURIComponent(amount.value).replace(/%2C/g, ',').replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}&script=${script.value}&space=${!compact.value}'`)
const responseExample = computed(() => result.value.ok ? JSON.stringify({ amount: result.value.normalized, currency: 'RSD', text: compact.value ? result.value.compact : result.value.text, compact: result.value.compact }, null, 2) : JSON.stringify({ error: result.value.error }, null, 2))
async function copyCurl() {
 try { await navigator.clipboard.writeText(curlCommand.value); curlNotice.value = 'Komanda je kopirana.' }
 catch { curlNotice.value = 'Kopiranje nije dostupno. Označite komandu i kopirajte je ručno.' }
}
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
    <div class="input-wrap"><input id="amount" v-model="amount" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" :aria-describedby="touched && !result.ok ? 'error' : undefined" :aria-invalid="touched && !result.ok" @input="notice = ''; curlNotice = ''; touched = false" @blur="touched = true"><span>RSD</span></div>
    <p v-if="touched && !result.ok" id="error" class="error" role="alert">{{ result.error }}</p>
    <div class="examples"><span>ISPROBAJTE</span><button v-for="example in examples" :key="example" type="button" @click="amount = example; notice = ''">{{ example }}</button></div>
    <div class="divider"></div>
    <fieldset class="script-picker"><legend>Pismo zapisa</legend><label><input v-model="script" type="radio" value="latn"> Latinica</label><label><input v-model="script" type="radio" value="cyrl"> Ћирилица</label></fieldset>
    <div class="result-head"><span>SLOVNI ZAPIS</span><label class="toggle"><input v-model="compact" type="checkbox" @change="notice = ''"> Bez razmaka</label></div>
    <div class="result" aria-live="polite">{{ output || 'Ovde će se prikazati slovni zapis.' }}</div>
    <div class="result-bottom"><span>{{ result.ok ? result.normalized + ' RSD' : 'Proverite unos' }}</span><button type="button" :disabled="!result.ok" @click="copy">Kopiraj zapis <span aria-hidden="true">↗</span></button></div>
    <p class="notice" aria-live="polite">{{ notice }}</p>
   </section>
   <section class="api-example" aria-labelledby="api-title">
    <div class="eyebrow">ZA PROGRAMERE</div><h2 id="api-title">Koristite API</h2>
    <p>Pošaljite GET zahtev sa sledećim parametrima. Odgovor je u JSON formatu.</p>
    <dl class="api-params"><div><dt><code>amount</code> <span>string · obavezan</span></dt><dd>Iznos u dinarima, npr. <code>10000.20</code> ili <code>10.000,20</code>.</dd></div><div><dt><code>script</code> <span>enum · opciono</span></dt><dd><code>latn</code> za latinicu (podrazumevano) ili <code>cyrl</code> za ćirilicu.</dd></div><div><dt><code>space</code> <span>boolean · opciono</span></dt><dd><code>true</code> za razmake (podrazumevano) ili <code>false</code> za spojeni zapis u polju <code>text</code>.</dd></div></dl>
    <div class="code-heading"><span>ZAHTEV</span><button type="button" @click="copyCurl">Kopiraj curl</button></div>
    <pre><code>{{ curlCommand }}</code></pre>
    <p class="curl-notice" aria-live="polite">{{ curlNotice }}</p>
    <p>Polje <code>text</code> prati parametar <code>space</code>; <code>compact</code> je uvek bez razmaka.</p>
    <div class="code-heading">PRIMER ODGOVORA</div>
    <pre><code>{{ responseExample }}</code></pre>
    <p>Primer se izračunava u pregledaču i ne prikazuje greške mreže ili ograničenje zahteva.</p>
    <p>Do 60 zahteva u minuti po IP adresi, približno po Cloudflare lokaciji.</p>
   </section>
   <div class="footnote"><span>✳</span><p>Više od dve decimale zaokružujemo na najbližu paru. Iznosi se obrađuju samo u vašem pregledaču.</p></div>
  </main><footer><span>U PARU</span><span>Jednostavno, do poslednje pare.</span></footer>
 </div>
</template>
