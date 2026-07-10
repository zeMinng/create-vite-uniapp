import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // Limit concurrent test execution to avoid resource exhaustion on CI runners
    // Reads from environment variable or defaults to 10 for local development
    maxConcurrency: process.env.TEST_MAX_CONCURRENCY ? parseInt(process.env.TEST_MAX_CONCURRENCY) : 10,
  },
})
