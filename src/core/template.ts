import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { TEMPLATE_ROOT } from '@/constants'
import type { Template } from '~types/template'

export type TemplateLayer = {
  id: string
  rootDir: string
  filesDir: string
  template: Template
}

export function getTemplateRoot(relativePath: string): string {
  return path.join(TEMPLATE_ROOT, relativePath)
}

export async function loadTemplateLayer(relativePath: string): Promise<TemplateLayer> {
  const rootDir = getTemplateRoot(relativePath)
  const filesDir = path.join(rootDir, 'files')
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Template not found: ${relativePath}`)
  }
  if (!fs.existsSync(filesDir)) {
    throw new Error(`Template files directory missing: ${relativePath}/files`)
  }

  const template = await loadTemplateModule(rootDir, relativePath)
  return {
    id: relativePath,
    rootDir,
    filesDir,
    template,
  }
}

async function loadTemplateModule(rootDir: string, fallbackName: string): Promise<Template> {
  const entryTs = path.join(rootDir, 'index.ts')
  const entryJs = path.join(rootDir, 'index.js')
  const entry = fs.existsSync(entryJs) ? entryJs : entryTs

  if (!fs.existsSync(entry)) {
    return {
      name: fallbackName,
      files: 'files',
    }
  }

  const mod = await import(pathToFileURL(entry).href)
  return (mod.default ?? mod.template) as Template
}