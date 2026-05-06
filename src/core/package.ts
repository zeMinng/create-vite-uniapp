import fs from 'node:fs'
import path from 'node:path'
import type { PackageJson, TemplateContext } from './context'

export function mergePackageJson(base: PackageJson, extra: PackageJson): PackageJson {
  return {
    ...base,
    ...extra,
    scripts: mergeKeepingOrder(
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
  sortDependencyMapsInPlace(ctx.pkg)
  const file = path.join(ctx.root, 'package.json')
  fs.writeFileSync(file, `${JSON.stringify(ctx.pkg, null, 2)}\n`)
}

/** Ensures stable alphabetical key order after merges and extendPackageJson spreads. */
function sortDependencyMapsInPlace(pkg: PackageJson): void {
  if (pkg.dependencies && typeof pkg.dependencies === 'object') {
    pkg.dependencies = sortKeysAlphabetically(asStringMap(pkg.dependencies))
  }
  if (pkg.devDependencies && typeof pkg.devDependencies === 'object') {
    pkg.devDependencies = sortKeysAlphabetically(asStringMap(pkg.devDependencies))
  }
}

function mergeAndSort(
  left: Record<string, string>,
  right: Record<string, string>,
): Record<string, string> {
  const merged = { ...left, ...right }
  return sortKeysAlphabetically(merged)
}

function sortKeysAlphabetically(record: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {}
  for (const key of Object.keys(record).sort()) {
    sorted[key] = record[key]
  }
  return sorted
}

function mergeKeepingOrder(
  left: Record<string, string>,
  right: Record<string, string>,
): Record<string, string> {
  return { ...left, ...right }
}

function asStringMap(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object') return {}
  return input as Record<string, string>
}