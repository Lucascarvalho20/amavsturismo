import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Testes rodam no fuso de Brasília: bugs de data (dia "voltando") só aparecem em UTC-3,
// e o CI roda em UTC.
process.env.TZ = 'America/Sao_Paulo'

export default defineConfig({
  test: { environment: 'node', include: ['lib/**/*.test.ts'], env: { TZ: 'America/Sao_Paulo' } },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
