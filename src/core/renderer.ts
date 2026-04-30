import fs from 'node:fs'
import path from 'node:path'
import type { TemplateContext } from './context'

const TEXT_TEMPLATE_EXTENSIONS = new Set([
  '.js', '.ts', '.mts', '.cts',
  '.json', '.md', '.txt', '.vue', '.html',
  '.css', '.scss', '.sass', '.less',
  '.yml', '.yaml', '.xml', '.d.ts',
])

type RenderDirOptions = {
  isRoot?: boolean
}

export function renderDir(
  src: string,
  dest: string,
  ctx: TemplateContext,
  options: RenderDirOptions = {},
): void {
  const { isRoot = true } = options
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const outputName = entry.name.endsWith('.ejs') ? entry.name.slice(0, -4) : entry.name
    const destPath = path.join(dest, outputName)

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      renderDir(srcPath, destPath, ctx, { isRoot: false })
      continue
    }

    // package.json is merged in generator layer-by-layer to avoid overwrite.
    if (isRoot && outputName === 'package.json') {
      continue
    }

    if (shouldRenderAsText(srcPath)) {
      const raw = fs.readFileSync(srcPath, 'utf8')
      fs.writeFileSync(destPath, renderTemplateString(raw, ctx))
      continue
    }

    fs.copyFileSync(srcPath, destPath)
  }
}

function shouldRenderAsText(filePath: string): boolean {
  const base = path.basename(filePath)
  if (base.endsWith('.ejs')) return true
  if (base === '.gitignore') return true
  return TEXT_TEMPLATE_EXTENSIONS.has(path.extname(base))
}

function renderTemplateString(content: string, ctx: TemplateContext): string {
  return content.replace(/<%=\s*projectName\s*%>/g, ctx.projectName)
}