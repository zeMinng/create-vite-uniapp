import fs from 'node:fs'
import type { TemplateFeature, TemplateVariant } from './registry'
import { TEMPLATE_REGISTRY } from './registry'

export type TemplateSelections = {
  variant: TemplateVariant
  needsEslint: boolean
  needsStylelint: boolean
}

export type TemplateLayer = {
  id: string
  src: string
  feature?: TemplateFeature
}

/**
 * Resolve template layers in a deterministic order.
 *
 * This resolver also validates template availability so unsupported combinations
 * fail fast with a clear error (instead of crashing later during file copy).
 */
export function resolveTemplateLayers(selections: TemplateSelections): TemplateLayer[] {
  const { variant, needsEslint, needsStylelint } = selections

  const layers: TemplateLayer[] = []

  // Step 1: base + language variant
  layers.push({ id: 'base', src: TEMPLATE_REGISTRY.base })
  layers.push({ id: `variant-${variant}`, src: TEMPLATE_REGISTRY.variant(variant) })

  // Step 2: optional eslint / stylelint feature layers
  if (needsEslint) {
    layers.push({ id: 'eslint-base', src: TEMPLATE_REGISTRY.features.eslint.base, feature: 'eslint' })
    layers.push({
      id: `eslint-core-${variant}`,
      src: TEMPLATE_REGISTRY.features.eslint.core(variant),
      feature: 'eslint',
    })
  }

  if (needsStylelint) {
    layers.push({ id: 'stylelint-base', src: TEMPLATE_REGISTRY.features.stylelint.base, feature: 'stylelint' })
    layers.push({
      id: `stylelint-core-${variant}`,
      src: TEMPLATE_REGISTRY.features.stylelint.core(variant),
      feature: 'stylelint',
    })
  }

  // Validate existence for every selected layer.
  // This effectively implements the "supported matrix" for current templates.
  const missing = layers.filter((l) => !fs.existsSync(l.src))
  if (missing.length > 0) {
    const missingList = missing
      .map((m) => `- ${m.id}: ${m.src}`)
      .join('\n')
    const mode = selections.variant === 'ts' ? 'TypeScript' : 'JavaScript'
    const extras = [
      selections.needsEslint ? 'ESLint' : null,
      selections.needsStylelint ? 'Stylelint' : null,
    ]
      .filter(Boolean)
      .join(' + ')

    throw new Error(
      `Unsupported template combination: ${mode}${extras ? ` + ${extras}` : ''}\nMissing template layers:\n${missingList}\n` +
        `Note: Either disable the requested feature(s) or add the missing template directories.`,
    )
  }

  return layers
}

