import type { Template } from '~types/template'

const template: Template = {
  name: 'base',
  files: 'files',
  extendPackageJson(pkg, ctx) {
    pkg.name = ctx.projectName
    pkg.version = '1.0.0'
  }
}

export default template