import path from 'node:path'
import type { Template } from '~types/template'

const template: Template = {
  name: 'stylelint',
  files: (ctx) => path.join('files', ctx.language),
  extendPackageJson(pkg, ctx) {
    const devDependencies = (pkg.devDependencies ?? {}) as Record<string, string>

    pkg.scripts = {
      ...pkg.scripts,
      "lint": "stylelint **/*.{css,scss}"
    }

    pkg.devDependencies = {
      ...devDependencies,
      "postcss-html": "^1.8.0",
      "stylelint": "^16.26.1",
      "stylelint-config-standard-scss": "^16.0.0",
      "stylelint-order": "^7.0.1",
      "stylelint-scss": "^6.14.0"
    }
  },
}

export default template
