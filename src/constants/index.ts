import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { blue, cyan, green, yellow, magenta } from 'picocolors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * template root directory (模板根目录)
 */
export const TEMPLATE_ROOT = path.resolve(__dirname, '../templates')
/**
 * default project name (默认项目名称)
 */
export const DEFAULT_PROJECT_NAME = 'my-vite-uniapp'
/**
 * base template path (基础模板路径)
 */
export const BASE_TEMPLATE_PATH = path.join(TEMPLATE_ROOT, 'base')

/**
 * framework options configuration (框架选项配置)
 */
export const FRAMEWORKS = [
  {
    name: 'vue',
    display: 'Vue',
    color: green,
    variants: [
      {
        name: 'vue-ts',
        display: 'TypeScript',
        color: blue,
        path: path.join(TEMPLATE_ROOT, 'ts')
      },
      {
        name: 'vue-js',
        display: 'JavaScript',
        color: yellow,
        path: path.join(TEMPLATE_ROOT, 'js')
      }
    ]
  }
]

/**
 * features path mapping (特性路径映射)
 */
export const FEATURE_PATHS = {
  eslint: {
    base: path.join(TEMPLATE_ROOT, 'features/eslint/base'),
    js: path.join(TEMPLATE_ROOT, 'features/eslint/core/js'),
    ts: path.join(TEMPLATE_ROOT, 'features/eslint/core/ts')
  }
  // add pinia and ...
}

/**
 * all options for interactive inquiry (所有交互式询问选项)
 */
export const PROMPTS_OPTIONS = {
  // is TS?
  isTypeScript: {
    name: 'isTypeScript',
    type: 'toggle',
    message: 'Add TypeScript?',
    initial: true,
    active: 'Yes',
    inactive: 'No'
  },
  // is ESLint?
  needsEslint: {
    name: 'needsEslint',
    type: 'toggle',
    message: 'Add ESLint for code quality?',
    initial: false,
    active: 'Yes',
    inactive: 'No'
  }
}

/**
 * files to ignore when copying files (复制文件时忽略的文件)
 */
export const IGNORE_FILES = [
  'node_modules',
  'dist',
  '.git',
  '.DS_Store',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
]

/**
 * terminal welcome and closing remarks (终端欢迎语和结束语)
 */
export const MESSAGES = {
  welcome: `\n${magenta('🚀 Welcome to create-vite-uniapp!')}\n`,
  finishing: (dir: string) => `\n${green('✨ Project created in')} ${cyan(dir)}\n`,
  nextSteps: (name: string, pkgManager: string) => `
  ${yellow('Next steps:')}
    cd ${name}
    ${pkgManager} install
    ${pkgManager} run dev
  `
}
