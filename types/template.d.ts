import type { TemplateContext, PackageJson } from '@/core/context'

export interface Template {
  name: string
  /** Static subdirectory under the template root, or a path relative to that root chosen from context (e.g. `files/ts` vs `files/js`). */
  files?: string | ((ctx: TemplateContext) => string)
  beforeRender?: (ctx: TemplateContext) => void | Promise<void>
  afterRender?: (ctx: TemplateContext) => void | Promise<void>
  extendPackageJson?: (pkg: PackageJson, ctx: TemplateContext) => void
}
