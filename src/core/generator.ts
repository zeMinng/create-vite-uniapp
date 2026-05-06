import fs from 'node:fs'
import path from 'node:path'
import type { TemplateContext } from './context'
import { mergePackageJson, writePackageJson } from './package'
import { renderDir } from './renderer'
import { resolveTemplates } from './resolver'

export async function generate(ctx: TemplateContext): Promise<void> {
  const layers = await resolveTemplates(ctx)

  for (const layer of layers) {
    await layer.template.beforeRender?.(ctx)
  }

  for (const layer of layers) {
    const layerPackageFile = path.join(layer.filesDir, 'package.json')
    if (fs.existsSync(layerPackageFile)) {
      const raw = fs.readFileSync(layerPackageFile, 'utf8')
      const rendered = raw.replace(/<%=\s*projectName\s*%>/g, ctx.projectName)
      const layerPkg = JSON.parse(rendered) as Record<string, unknown>
      ctx.pkg = mergePackageJson(ctx.pkg, layerPkg)
    }
    renderDir(layer.filesDir, ctx.root, ctx)
  }

  for (const layer of layers) {
    await layer.template.afterRender?.(ctx)
  }

  for (const layer of layers) {
    layer.template.extendPackageJson?.(ctx.pkg, ctx)
  }

  const packageFile = path.join(ctx.root, 'package.json')
  if (fs.existsSync(packageFile)) {
    const renderedPkg = JSON.parse(fs.readFileSync(packageFile, 'utf8')) as Record<string, unknown>
    ctx.pkg = mergePackageJson(renderedPkg, ctx.pkg)
  }

  writePackageJson(ctx)
}