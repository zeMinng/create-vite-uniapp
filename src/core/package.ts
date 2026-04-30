import fs from 'node:fs'
import path from 'node:path'
import type { PackageJson, TemplateContext } from './context'

export function mergePackageJson(base: PackageJson, extra: PackageJson): PackageJson {
  return {
    ...base,
    ...extra,
    scripts: mergeAndSort(
      asStringMap(base.scripts),
      asStringMap(extra.scripts),
    ),
    dependencies: mergeAndSort(
      asStringMap(base.dependencies),
      asStringMap(extra.dependencies),
    ),
    devDependencies: mergeAndSort(
      asStringMap(base.devDependencies),
      asStringMap(extra.devDependencies),
    ),
  }
}

export function writePackageJson(ctx: TemplateContext): void {
  const file = path.join(ctx.root, 'package.json')
  fs.writeFileSync(file, `${JSON.stringify(ctx.pkg, null, 2)}\n`)
}

function mergeAndSort(
  left: Record<string, string>,
  right: Record<string, string>,
): Record<string, string> {
  const merged = { ...left, ...right }
  const sorted: Record<string, string> = {}
  for (const key of Object.keys(merged).sort()) {
    sorted[key] = merged[key]
  }
  return sorted
}

function asStringMap(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object') return {}
  return input as Record<string, string>
}