import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * default project name (默认项目名称)
 */
export const DEFAULT_PROJECT_NAME = 'my-vite-uniapp'
import fs from 'node:fs'
/**
 * template root directory (模板根目录)
 */
export const TEMPLATE_ROOT = fs.existsSync(path.resolve(__dirname, '../templates'))
  ? path.resolve(__dirname, '../templates')
  : path.resolve(__dirname, '../../templates')
/**
 * base template path (基础模板路径)
 */
export const BASE_TEMPLATE_PATH = path.join(TEMPLATE_ROOT, 'base')
export const LANGUAGE_TEMPLATE_PATH = path.join(TEMPLATE_ROOT, 'language')
