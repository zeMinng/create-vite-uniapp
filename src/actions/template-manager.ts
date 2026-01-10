import fs from 'node:fs'
import path from 'node:path'

/**
 * Copies the files from the source directory to the destination directory.
 * This function is used to copy the template files to the project directory.
 * @param {string} src The source directory.
 * @param {string} dest The destination directory.
 */
export function renderTemplate(src: string, dest: string) {
  const stats = fs.statSync(src)
  // is a directory?
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    for (const file of fs.readdirSync(src)) {
      const srcFile = path.resolve(src, file)
      const destFile = path.resolve(dest, file)
      renderTemplate(srcFile, destFile)
    }
    return
  }

  // is a package.json? merge
  if (path.basename(src) === 'package.json' && fs.existsSync(dest)) {
    const existing = JSON.parse(fs.readFileSync(dest, 'utf8'))
    const incoming = JSON.parse(fs.readFileSync(src, 'utf8'))
    const merged = {
      ...existing,
      ...incoming,
      scripts: { ...existing.scripts, ...incoming.scripts },
      dependencies: { ...existing.dependencies, ...incoming.dependencies },
      devDependencies: { ...existing.devDependencies, ...incoming.devDependencies },
    }
    
    fs.writeFileSync(dest, JSON.stringify(merged, null, 2) + '\n')
    return
  }

  fs.copyFileSync(src, dest)
}
