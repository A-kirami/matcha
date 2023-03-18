import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    reporters: 'html',
    open: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
