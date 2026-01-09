import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  minify: true,
  clean: true,
  fixedExtension: false,
  platform: 'node',
})
