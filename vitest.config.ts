import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Limit concurrent test execution to avoid resource exhaustion on CI runners
    // Reads from environment variable or defaults to 10 for local development
    maxConcurrency: process.env.TEST_MAX_CONCURRENCY
      ? parseInt(process.env.TEST_MAX_CONCURRENCY)
      : 10,
  },
})
