import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const pkgPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../package.json'
)

export const { version } = JSON.parse(readFileSync(pkgPath, 'utf-8'))
