import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_PROJECT_NAME } from '@/constants'

export type Language = 'ts' | 'js'
export type PackageJson = Record<string, unknown>

export type CreateContextOptions = {
  projectName: string
  targetDir: string
  language: Language
  features: string[]
}

export type TemplateContext = CreateContextOptions & {
  root: string
  pkg: PackageJson
  addFile: (filePath: string, content: string) => void
  modifyFile: (filePath: string, updater: (content: string) => string) => void
  renameFile: (from: string, to: string) => void
  extendPackageJson: (partial: PackageJson) => void
}

export function createContext(options: CreateContextOptions): TemplateContext {
  const root = path.resolve(options.targetDir)

  // Ensure project root exists before renderer writes first file.
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  const ctx: TemplateContext = {
    ...options,
    projectName: options.projectName || DEFAULT_PROJECT_NAME,
    root,
    pkg: {},
    addFile(filePath: string, content: string) {
      const fullPath = path.join(root, filePath)
      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, content)
    },
    modifyFile(filePath: string, updater: (content: string) => string) {
      const fullPath = path.join(root, filePath)
      const content = fs.readFileSync(fullPath, 'utf-8')
      fs.writeFileSync(fullPath, updater(content))
    },
    renameFile(from: string, to: string) {
      fs.renameSync(path.join(root, from), path.join(root, to))
    },
    extendPackageJson(partial: PackageJson) {
      ctx.pkg = deepMerge(ctx.pkg, partial)
    },
  }

  return ctx
}

function deepMerge(target: PackageJson, source: PackageJson): PackageJson {
  const result: PackageJson = { ...target }
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = result[key]
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else {
      result[key] = sourceValue
    }
  }
  return result
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}