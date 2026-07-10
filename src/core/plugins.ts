import fs from 'node:fs'
import path from 'node:path'
import { TEMPLATE_ROOT } from '../constants'

export interface PluginMeta {
  name: string
  display: string
  description: string
  order: number
  dir: string // Plugin directory absolute path. (插件目录绝对路径)
}

/**
 * Scan templates/plugins/ dir, parse metadata, return sorted plugin list.
 * 自动扫描templates/plugins/目录，解析各子目录_inject.json元数据，返回有序插件列表
 */
export function discoverPlugins(): PluginMeta[] {
  const pluginsDir = path.join(TEMPLATE_ROOT, 'plugins')
  if (!fs.existsSync(pluginsDir)) return []
  const dirents = fs.readdirSync(pluginsDir, { withFileTypes: true })
  const plugins: PluginMeta[] = []

  for (const d of dirents) {
    if (!d.isDirectory()) continue

    const dir = path.join(pluginsDir, d.name)
    const injectPath = path.join(dir, '_inject.json')
    if (!fs.existsSync(injectPath)) continue

    try {
      const config = JSON.parse(fs.readFileSync(injectPath, 'utf-8'))
      plugins.push({
        name: config.name ?? d.name,
        display: config.display ?? d.name,
        description: config.description ?? '',
        order: config.order ?? 999,
        dir,
      })
    } catch {
      continue
    }
  }
  return plugins.sort((a, b) => a.order - b.order)
}
