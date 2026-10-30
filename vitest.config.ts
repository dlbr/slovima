import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins: [vue()], resolve: { alias: { vue: new URL('./node_modules/vue/dist/vue.runtime-with-vapor.esm-browser.js', import.meta.url).pathname } }, test: { include: ['src/**/*.test.ts'], coverage: { provider: 'v8', include: ['src/amount.ts', 'src/App.vue', 'src/worker.ts'], reporter: ['text', 'html'], thresholds: { lines: 90, functions: 90, statements: 90, branches: 90 } } } })
