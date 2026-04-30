import type { Template } from '~types/template'

const template: Template = {
  name: 'typescript',
  files: 'files',
  // extendPackageJson(pkg) {
  //   const devDependencies = (pkg.devDependencies ?? {}) as Record<string, string>
  //   pkg.devDependencies = {
  //     ...devDependencies,
  //     typescript: '^5.0.0',
  //   }
  // },
}

export default template