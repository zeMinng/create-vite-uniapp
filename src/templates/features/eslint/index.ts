import type { Template } from '~types/template'

const template: Template = {
  name: 'eslint',
  files: 'files',
  extendPackageJson(pkg, ctx) {
    const devDependencies = (pkg.devDependencies ?? {}) as Record<string, string>
    pkg.devDependencies = {
      ...devDependencies,
      eslint: '^9.0.0',
    }

    if (ctx.language === 'ts') {
      const current = pkg.devDependencies as Record<string, string>
      current['@typescript-eslint/parser'] = '^7'
      current['@typescript-eslint/eslint-plugin'] = '^7'
    }
  },
}

export default template