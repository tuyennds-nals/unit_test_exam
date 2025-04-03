import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/services/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/services'],
      reporter: ['text', 'html'],
    },
    environment: 'jsdom',
  },
})
