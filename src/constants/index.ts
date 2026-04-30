import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cyan, green, yellow, magenta } from 'picocolors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// default project name (默认项目名称)
export const DEFAULT_PROJECT_NAME = 'my-vite-uniapp'
// template root directory (模板根目录)
export const TEMPLATE_ROOT = path.resolve(__dirname, '../src/templates')
// base template path (基础模板路径)
export const BASE_TEMPLATE_PATH = path.join(TEMPLATE_ROOT, 'base')

/**
 * terminal welcome and closing remarks (终端欢迎语和结束语)
 */
export const MESSAGES = {
  welcome: `\n${magenta('🚀 Welcome to create-vite-uniapp!')}\n`,
  finishing: (dir: string) => `\n${green('✨ Project created in')} ${cyan(dir)}\n`,
  nextSteps: (name: string, pkgManager: string, shouldInstallDeps: boolean = true) => `
  ${yellow('Next steps:')}
    cd ${name}
    ${shouldInstallDeps ? `${pkgManager} install` : 'skip dependency installation'}
    ${pkgManager} run dev
  `
}

/**
 * all options for interactive inquiry (所有交互式询问选项)
 */
export const PROMPTS_OPTIONS = {
  // select language.
  isTypeScript: {
    name: 'isTypeScript',
    type: 'select',
    message: 'Select a variant:',
    options: [
      { value: true, label: 'TypeScript', hint: 'recommended' },
      { value: false, label: 'JavaScript' }
    ],
    initialValue: true
  },
  // is ESLint?
  needsEslint: {
    name: 'needsEslint',
    type: 'confirm',
    message: 'Add ESLint for project?',
    initialValue: true,
  },
  // is Stylelint?
  needsStylelint: {
    name: 'needsStylelint',
    type: 'confirm',
    message: 'Add StyleLint for project?',
    initialValue: true,
  },
  // is Install When Creating A Project?
  immediateInstall: {
    name: 'immediateInstall',
    type: 'confirm',
    message: 'Install with npm and start now?',
    initialValue: false,
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
