import fs from 'node:fs/promises'
import path from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Copy the contents of a directory to another directory. (拷贝目录的内容到另一个目录)
 * @param src - The source directory path. (源目录路径)
 * @param dest - The destination directory path. (目标目录路径)
 * @returns Promise<void>
 */
export async function copyContents(src: string, dest: string): Promise<void> {
  if (!existsSync(src)) return

  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    await fs.cp(srcPath, destPath, { recursive: true })
  }
}
