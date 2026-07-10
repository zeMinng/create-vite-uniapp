import fs from 'node:fs/promises'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { BASE_TEMPLATE_PATH, LANGUAGE_TEMPLATE_PATH, TEMPLATE_ROOT } from '../../constants'
import type { ProjectInfoResult } from '../../types'
import { copyContents } from './copy'
import { mergeJson } from './merge'
import { parseInject } from './inject'

/**
 * Apply a plugin/language directory's `_inject.json` to the target project.
 * Merges pkgJson, removes files, collects vite imports/plugins/configs.
 *
 * (将插件/语言目录的 `_inject.json` 应用到目标项目)
 */
async function applyInject(
  pluginDir: string,
  isTS: boolean,
  targetPath: string,
  pkgJson: Record<string, unknown>,
  imports: string[],
  plugins: string[],
  configs: Record<string, unknown>[],
  mainImports: string[],
  mainSetup: string[],
  mainCreateApp: string[],
): Promise<Record<string, unknown>> {
  const result = await parseInject(pluginDir, isTS)

  if (Object.keys(result.pkgJson).length > 0) {
    pkgJson = mergeJson(pkgJson, result.pkgJson)
  }
  for (const f of result.remove) {
    await fs.rm(path.join(targetPath, f), { force: true })
  }
  imports.push(...result.viteImports)
  plugins.push(...result.vitePlugins)
  if (Object.keys(result.viteConfig).length > 0) {
    configs.push(result.viteConfig)
  }
  mainImports.push(...result.mainImports)
  mainSetup.push(...result.mainSetup)
  mainCreateApp.push(...result.mainCreateApp)

  return pkgJson
}

/**
 * Modify the generated project's vite.config.{ts|js}.
 * Injects import statements, top-level config entries, and plugins array entries.
 *
 * (修改生成项目的 vite.config.{ts|js}，注入 import 语句、顶层配置、以及 plugins 数组条目)
 */
function injectViteConfig(opts: {
  targetDir: string
  isTS: boolean
  imports: string[]
  plugins: string[]
  configs: Record<string, unknown>[]
}): void {
  const { targetDir, isTS, imports, plugins, configs } = opts
  if (imports.length === 0 && plugins.length === 0 && configs.length === 0) return

  const configFile = isTS ? 'vite.config.ts' : 'vite.config.js'
  const configPath = path.join(targetDir, configFile)
  if (!existsSync(configPath)) return

  let content = readFileSync(configPath, 'utf-8')

  if (imports.length > 0) {
    const lastImportIdx = content.lastIndexOf('import ')
    if (lastImportIdx !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIdx)
      content = content.slice(0, lineEnd + 1)
        + imports.join('\n') + '\n'
        + content.slice(lineEnd + 1)
    } else {
      content = imports.join('\n') + '\n' + content
    }
  }

  // Merge top-level vite config into defineConfig({...})
  if (configs.length > 0) {
    const merged = configs.reduce((acc, c) => mergeJson(acc, c), {})
    if (Object.keys(merged).length > 0) {
      const configBlock = formatTopLevelConfig(merged, '  ')
      content = content.replace(
        /export default defineConfig\(\{/,
        `export default defineConfig({\n${configBlock},`,
      )
    }
  }

  if (plugins.length > 0) {
    content = content.replace(
      /plugins:\s*\[([^\]]*)\]/,
      (_: string, existing: string) => {
        const exist = existing.trim()
        return `plugins: [${exist ? exist + ', ' : ''}${plugins.join(', ')}]`
      },
    )
  }

  writeFileSync(configPath, content, 'utf-8')
}

/** Format a config object as indented JS object literal entries. */
function formatTopLevelConfig(
  config: Record<string, unknown>,
  indent: string,
): string {
  return Object.entries(config).map(([key, value]) => {
    const jsonLines = JSON.stringify(value, null, 2).split('\n')
    const first = `${indent}${key}: ${jsonLines[0]}`
    const rest = jsonLines.slice(1).map(l => indent + l)
    return [first, ...rest].join('\n')
  }).join(',\n')
}

/**
 * Inject imports and inline code into the generated project's main.{ts|js}.
 * Supports three injection points:
 * - `main.imports`: appended after the last `import ` statement
 * - `main.setup`: inserted before `export function createApp()`
 * - `main.createApp`: inserted after `const app = createSSRApp(App);`
 *
 * (向生成项目的 main.{ts|js} 注入 import 语句和初始化代码)
 */
export function injectMainFile(opts: {
  targetDir: string
  isTS: boolean
  mainImports: string[]
  mainSetup: string[]
  mainCreateApp: string[]
}): void {
  const { targetDir, isTS, mainImports, mainSetup, mainCreateApp } = opts
  if (mainImports.length === 0 && mainSetup.length === 0 && mainCreateApp.length === 0) return

  const mainFile = isTS ? 'main.ts' : 'main.js'
  const mainPath = path.join(targetDir, 'src', mainFile)
  if (!existsSync(mainPath)) return

  let content = readFileSync(mainPath, 'utf-8')

  // 1. Inject imports after the last existing import statement
  if (mainImports.length > 0) {
    const lastImportIdx = content.lastIndexOf('import ')
    if (lastImportIdx !== -1) {
      const lineEnd = content.indexOf('\n', lastImportIdx)
      content = content.slice(0, lineEnd + 1)
        + mainImports.join('\n') + '\n'
        + content.slice(lineEnd + 1)
    } else {
      content = mainImports.join('\n') + '\n' + content
    }
  }

  // 2. Inject setup code before `export function createApp()`
  if (mainSetup.length > 0) {
    const anchor = 'export function createApp()'
    const idx = content.indexOf(anchor)
    if (idx !== -1) {
      const setupBlock = mainSetup.join('\n') + '\n'
      content = content.slice(0, idx) + setupBlock + content.slice(idx)
    }
  }

  // 3. Inject code into createApp() body after `const app = createSSRApp(App);`
  if (mainCreateApp.length > 0) {
    const createAppLine = 'const app = createSSRApp(App);'
    const idx = content.indexOf(createAppLine)
    if (idx !== -1) {
      const lineStart = content.lastIndexOf('\n', idx) + 1
      const indent = content.slice(lineStart, idx)
      const injectedLines = mainCreateApp.map(line => indent + line).join('\n')
      const insertAt = idx + createAppLine.length
      content = content.slice(0, insertAt) + '\n' + injectedLines + content.slice(insertAt)
    }
  }

  writeFileSync(mainPath, content, 'utf-8')
}

/**
 * Render the template to the target directory. (将模板渲染到目标目录)
 * @param targetPath - The target directory path. (目标目录路径)
 * @param result - The project information result. (项目信息结果)
 */
export async function renderTemplate(
  targetPath: string,
  result: ProjectInfoResult,
): Promise<void> {
  // 1. create target directory. (创建目标目录)
  await fs.mkdir(targetPath, { recursive: true })
  // 2. copy base template. (拷贝 base 模板)
  await copyContents(BASE_TEMPLATE_PATH, targetPath)

  // 3. read base package.json. (读取 base 的 package.json 作为合并基准)
  const pkgPath = path.join(targetPath, 'package.json')
  let pkgJson: Record<string, unknown> = existsSync(pkgPath)
    ? JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
    : { name: result.projectName, version: '1.0.0' }

  const imports: string[] = []
  const plugins: string[] = []
  const configs: Record<string, unknown>[] = []
  const mainImports: string[] = []
  const mainSetup: string[] = []
  const mainCreateApp: string[] = []

  // copy language template (拷贝语言模板)
  const languageDir = LANGUAGE_TEMPLATE_PATH
  if (existsSync(languageDir)) {
    pkgJson = await applyInject(languageDir, result.isTypeScript, targetPath, pkgJson, imports, plugins, configs, mainImports, mainSetup, mainCreateApp)
    const langSubDir = path.join(languageDir, result.isTypeScript ? 'ts' : 'js')
    if (existsSync(langSubDir)) {
      await copyContents(langSubDir, targetPath)
    }
  }

  // 4. Parse plugins. (遍历选中的插件)
  for (const name of result.plugins || []) {
    const pluginDir = path.join(TEMPLATE_ROOT, 'plugins', name)
    if (!existsSync(pluginDir)) continue

    // 4a. Apply _inject.json (应用 _inject.json)
    pkgJson = await applyInject(pluginDir, result.isTypeScript, targetPath, pkgJson, imports, plugins, configs, mainImports, mainSetup, mainCreateApp)

    // 4b. Copy language-specific files (拷贝语言特定文件)
    const langDir = path.join(pluginDir, result.isTypeScript ? 'ts' : 'js')
    if (existsSync(langDir)) {
      await copyContents(langDir, targetPath)
    }

    // 4c. Copy files (拷贝无条件文件，排除 _inject.json、js/、ts/)
    const entries = await fs.readdir(pluginDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === '_inject.json' || entry.name === 'js' || entry.name === 'ts') continue
      const src = path.join(pluginDir, entry.name)
      const dest = path.join(targetPath, entry.name)
      await fs.cp(src, dest, { recursive: true })
    }
  }

  // 5. Inject vite config. (如果有 vite 注入项 → 修改 vite.config.{ts|js})
  injectViteConfig({ targetDir: targetPath, isTS: result.isTypeScript, imports, plugins, configs })

  // 6. Inject main file. (如果有 main 注入项 → 修改 main.{ts|js})
  injectMainFile({ targetDir: targetPath, isTS: result.isTypeScript, mainImports, mainSetup, mainCreateApp })

  // 7. Write project name. (写入项目名并回写 package.json)
  pkgJson.name = result.projectName
  await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2), 'utf-8')
}
