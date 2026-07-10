import { getPackageName, getVersion } from './info'

/**
 * Check for updates (检查更新) —— 非阻塞，3s 超时，失败返回 null
 */
export async function checkForUpdates(): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    timer.unref?.()

    const res = await fetch(`https://registry.npmjs.org/${getPackageName()}/latest`, {
      signal: controller.signal
    })
    if (!res.ok) return null

    const { version } = await res.json()
    const current = getVersion()

    return version !== current ? version : null
  } catch { return null }
}
