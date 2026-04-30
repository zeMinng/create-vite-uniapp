import type { TemplateContext, PackageJson } from '@/core/context'

export interface Template {
  name: string
  files?: string
  beforeRender?: (ctx: TemplateContext) => void | Promise<void>
  afterRender?: (ctx: TemplateContext) => void | Promise<void>
  extendPackageJson?: (pkg: PackageJson, ctx: TemplateContext) => void
}
