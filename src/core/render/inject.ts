import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { mergeJson } from './merge'

export interface InjectResult {
  /** The merged `package.json` object. (合并后的 `package.json` 对象) */
  pkgJson: Record<string, unknown>
  /** The list of files to remove from the target directory. (需要从目标目录删除的文件列表) */
  remove: string[]
  /** The list of Vite imports to add. (需要添加的 Vite 导入列表) */
  viteImports: string[]
  /** The list of Vite plugins to add. (需要添加的 Vite 插件列表) */
  vitePlugins: string[]
  /** Top-level Vite config to merge into defineConfig({...}). (要合并到 defineConfig 的顶层 Vite 配置) */
  viteConfig: Record<string, unknown>
  /** Import statements to inject into main.{ts|js}. (要注入到 main.{ts|js} 的 import 语句) */
  mainImports: string[]
  /** Top-level setup code to inject before `export function createApp()` in main.{ts|js}. */
  mainSetup: string[]
  /** Code to inject inside createApp() body in main.{ts|js}. */
  mainCreateApp: string[]
}

const EMPTY_INJECT: InjectResult = {
  pkgJson: {},
  remove: [],
  viteImports: [],
  vitePlugins: [],
  viteConfig: {},
  mainImports: [],
  mainSetup: [],
  mainCreateApp: [],
}

/**
 * Parse the `_inject.json` file of a plugin and return the merged result.
 * (解析插件的 `_inject.json` 文件，返回合并后的结果)
 * @param pluginDir The directory of the plugin. (插件目录)
 * @param isTS Whether the project is TypeScript. (是否为 TypeScript 项目)
 * @returns The merged result. (合并后的结果)
 */
export async function parseInject(pluginDir: string, isTS: boolean): Promise<InjectResult> {
  const injectPath = path.join(pluginDir, '_inject.json')

  if (!existsSync(injectPath)) {
    return { ...EMPTY_INJECT }
  }

  const raw = await fs.readFile(injectPath, 'utf-8')
  const config = JSON.parse(raw)

  let pkgJson: Record<string, unknown> = config['package.json'] ?? {}

  if (isTS && config['package.json:ts']) {
    pkgJson = mergeJson(pkgJson, config['package.json:ts'])
  }

  return {
    pkgJson,
    remove: config.remove ?? [],
    viteImports: config['vite.imports'] ?? [],
    vitePlugins: config['vite.plugins'] ?? [],
    viteConfig: config['vite.config'] ?? {},
    mainImports: config['main.imports'] ?? [],
    mainSetup: config['main.setup'] ?? [],
    mainCreateApp: config['main.createApp'] ?? [],
  }
}
