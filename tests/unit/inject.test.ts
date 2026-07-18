import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { parseInject } from '@/core/render/inject'
import { injectMainFile } from '@/core/render/index'
import { TEMPLATE_ROOT } from '@/constants'

const TS_FIXTURE = `import { createSSRApp } from "vue";
import App from "./App.vue";
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}`

const JS_FIXTURE = `import {
\tcreateSSRApp
} from "vue";
import App from "./App.vue";
export function createApp() {
\tconst app = createSSRApp(App);
\treturn {
\t\tapp,
\t};
}`

async function writeAndInject(
  tmpDir: string,
  isTS: boolean,
  opts: { mainImports?: string[]; mainSetup?: string[]; mainCreateApp?: string[] },
) {
  const srcDir = path.join(tmpDir, 'src')
  await fs.mkdir(srcDir, { recursive: true })
  const file = path.join(srcDir, isTS ? 'main.ts' : 'main.js')
  await fs.writeFile(file, isTS ? TS_FIXTURE : JS_FIXTURE, 'utf-8')

  injectMainFile({
    targetDir: tmpDir,
    isTS,
    mainImports: opts.mainImports ?? [],
    mainSetup: opts.mainSetup ?? [],
    mainCreateApp: opts.mainCreateApp ?? [],
  })

  return await fs.readFile(file, 'utf-8')
}

describe('parseInject - main fields', () => {
  it('parses main.imports and main.createApp from pinia _inject.json', async () => {
    const piniaDir = path.join(TEMPLATE_ROOT, 'plugins', 'pinia')
    for (const isTS of [true, false]) {
      const result = await parseInject(piniaDir, isTS)
      expect(result.mainImports).toContain("import store from './store'")
      expect(result.mainCreateApp).toContain('app.use(store)')
      expect(result.mainSetup).toEqual([])
    }
  })

  it('returns empty arrays when main fields are absent', async () => {
    const eslintDir = path.join(TEMPLATE_ROOT, 'plugins', 'eslint')
    const result = await parseInject(eslintDir, true)
    expect(result.mainImports).toEqual([])
    expect(result.mainSetup).toEqual([])
    expect(result.mainCreateApp).toEqual([])
  })
})

describe('injectMainFile', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), 'cvu-inject-' + Math.random().toString(36).slice(2))
    await fs.mkdir(tmpDir, { recursive: true })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('injects imports after the last existing import (TS)', async () => {
    const result = await writeAndInject(tmpDir, true, {
      mainImports: ["import store from './store'"],
    })

    expect(result).toContain("import store from './store'")
    const appImportIdx = result.indexOf('import App from')
    const storeImportIdx = result.indexOf("import store from './store'")
    expect(storeImportIdx).toBeGreaterThan(appImportIdx)
  })

  it('injects imports after the last existing import (JS)', async () => {
    const result = await writeAndInject(tmpDir, false, {
      mainImports: ["import store from './store'"],
    })

    expect(result).toContain("import store from './store'")
    const appImportIdx = result.indexOf('import App from')
    const storeImportIdx = result.indexOf("import store from './store'")
    expect(storeImportIdx).toBeGreaterThan(appImportIdx)
  })

  it('injects setup code before export function createApp()', async () => {
    const result = await writeAndInject(tmpDir, true, {
      mainSetup: ['// global setup code'],
    })

    const setupIdx = result.indexOf('// global setup code')
    const exportIdx = result.indexOf('export function createApp()')
    expect(setupIdx).toBeGreaterThan(-1)
    expect(setupIdx).toBeLessThan(exportIdx)
  })

  it('injects code after const app = createSSRApp(App) (TS — spaces)', async () => {
    const result = await writeAndInject(tmpDir, true, {
      mainCreateApp: ['app.use(store)'],
    })

    expect(result).toContain('  app.use(store)')
    const createIdx = result.indexOf('createSSRApp')
    const appUseIdx = result.indexOf('app.use(store)')
    const returnIdx = result.indexOf('return {')
    expect(appUseIdx).toBeGreaterThan(createIdx)
    expect(appUseIdx).toBeLessThan(returnIdx)
  })

  it('injects code after const app = createSSRApp(App) (JS — tab)', async () => {
    const result = await writeAndInject(tmpDir, false, {
      mainCreateApp: ['app.use(store)'],
    })

    expect(result).toContain('\tapp.use(store)')
  })

  it('no-op when all arrays are empty', async () => {
    const result = await writeAndInject(tmpDir, true, {})
    expect(result).toBe(TS_FIXTURE)
  })

  it('no-op when main file does not exist', () => {
    // injectMainFile silently returns when src/main.ts is missing
    expect(() =>
      injectMainFile({
        targetDir: tmpDir,
        isTS: true,
        mainImports: ['import x from "y"'],
        mainSetup: [],
        mainCreateApp: [],
      }),
    ).not.toThrow()
  })

  it('handles all three injection points together', async () => {
    const result = await writeAndInject(tmpDir, true, {
      mainImports: ["import store from './store'"],
      mainSetup: ['// pre-createApp setup'],
      mainCreateApp: ['app.use(store)'],
    })

    // Verify order: imports → setup → createApp injection
    const importIdx = result.indexOf("import store from './store'")
    const setupIdx = result.indexOf('// pre-createApp setup')
    const exportIdx = result.indexOf('export function createApp()')
    const appUseIdx = result.indexOf('app.use(store)')
    const returnIdx = result.indexOf('return {')

    expect(importIdx).toBeLessThan(setupIdx)
    expect(setupIdx).toBeLessThan(exportIdx)
    expect(exportIdx).toBeLessThan(appUseIdx)
    expect(appUseIdx).toBeLessThan(returnIdx)
  })
})
