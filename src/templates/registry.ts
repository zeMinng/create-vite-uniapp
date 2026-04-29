import path from 'node:path'
import { BASE_TEMPLATE_PATH, TEMPLATE_ROOT } from '../constants'

export type TemplateVariant = 'ts' | 'js'
export type TemplateFeature = 'eslint' | 'stylelint'

/**
 * Template assets under repo `templates/` (published next to `dist/`):
 * - `base/`: shared skeleton
 * - `variants/<ts|js>/`: language-specific files
 * - `features/<name>/base/`: feature manifest snippets (e.g. partial package.json)
 * - `features/<name>/core/<ts|js>/`: variant-specific tool configs
 *
 * All `path.join(TEMPLATE_ROOT, ...)` lives here, not in `create` / CLI.
 */
export const TEMPLATE_REGISTRY = {
  base: BASE_TEMPLATE_PATH,
  variant: (variant: TemplateVariant) => path.join(TEMPLATE_ROOT, 'variants', variant),
  features: {
    eslint: {
      base: path.join(TEMPLATE_ROOT, 'features', 'eslint', 'base'),
      core: (variant: TemplateVariant) =>
        path.join(TEMPLATE_ROOT, 'features', 'eslint', 'core', variant),
    },
    // Disk folder is `styleLint` in the repo (case); keep exact case for Linux/macOS.
    stylelint: {
      base: path.join(TEMPLATE_ROOT, 'features', 'styleLint', 'base'),
      core: (variant: TemplateVariant) =>
        path.join(TEMPLATE_ROOT, 'features', 'styleLint', 'core', variant),
    },
  },
} as const

