import fs from 'node:fs'
import path from 'node:path'
import type { TemplateContext } from './context'
import { getTemplateRoot, loadTemplateLayer, type TemplateLayer } from './template'

export async function resolveTemplates(ctx: TemplateContext): Promise<TemplateLayer[]> {
  const layers: TemplateLayer[] = []

  layers.push(await loadTemplateLayer('base'))
  layers.push(await loadTemplateLayer(`languages/${ctx.language}`))

  for (const feature of ctx.features) {
    const featurePath = `features/${feature}`
    const featureRoot = getTemplateRoot(featurePath)
    const filesDir = path.join(featureRoot, 'files')
    if (!fs.existsSync(featureRoot) || !fs.existsSync(filesDir)) {
      continue
    }
    layers.push(await loadTemplateLayer(featurePath, ctx))
  }

  return layers
}