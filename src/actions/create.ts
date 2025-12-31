import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getProjectInfo } from '../prompts.js'
import { log } from '../utils/logger.js'

/**
 * 获取模板目录路径
 * 支持两种场景：
 * 1. 本地开发：从 dist/actions/create.js 向上查找项目根目录
 * 2. npm create：从包根目录（index.js 所在位置）查找 templates
 */
function getTemplatesDir(): string {
  const currentFile = fileURLToPath(import.meta.url)
  let currentDir = path.dirname(currentFile)

  // 场景1: 从当前文件位置向上查找，直到找到包含 templates 目录的目录
  while (currentDir !== path.dirname(currentDir)) {
    const templatesPath = path.join(currentDir, 'templates')
    if (fs.existsSync(templatesPath)) {
      return templatesPath
    }
    currentDir = path.dirname(currentDir)
  }

  // 场景2: npm create 场景 - 从 index.js 的位置查找（包根目录）
  // index.js 在包根目录，templates 也在包根目录
  // 需要从 dist/actions/create.js 向上找到包根目录
  const distDir = path.dirname(currentFile)
  if (distDir.includes('dist')) {
    // 从 dist/actions 向上到包根目录
    const packageRoot = path.resolve(distDir, '../..')
    const templatesPath = path.join(packageRoot, 'templates')
    if (fs.existsSync(templatesPath)) {
      return templatesPath
    }
  }

  // 场景3: 如果是在 node_modules 中（npm create 场景）
  // 尝试从当前文件向上查找 node_modules，然后找到包根目录
  let searchDir = currentFile
  while (searchDir !== path.dirname(searchDir)) {
    if (path.basename(searchDir) === 'node_modules') {
      // 在 node_modules 中找到包目录
      const packageDir = path.join(searchDir, 'create-vite-uniapp')
      const templatesPath = path.join(packageDir, 'templates')
      if (fs.existsSync(templatesPath)) {
        return templatesPath
      }
      break
    }
    searchDir = path.dirname(searchDir)
  }

  // 添加调试信息
  const errorMsg = [
    '无法找到模板目录。',
    `当前文件位置: ${currentFile}`,
    `已搜索到: ${currentDir}`,
    '请确保 templates 目录存在于包根目录。',
  ].join('\n')
  throw new Error(errorMsg)
}

const templatesDir = getTemplatesDir()

/**
 * 递归复制目录（同步）
 */
function copyDirSync(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

export async function createProject(
  name?: string,
  options?: { template?: string }
) {
  let projectName: string
  let template: string

  // 如果提供了名称和模板，跳过交互式提示
  if (name && options?.template) {
    projectName = name
    template = options.template
  } else {
    // 否则使用交互式提示
    const result = await getProjectInfo(name)
    projectName = result.name
    template = options?.template || result.template
  }

  const targetDir = path.resolve(process.cwd(), projectName)
  const templateDir = path.resolve(templatesDir, template)

  if (!fs.existsSync(templateDir)) {
    log.error(`模板 "${template}" 未找到`)
    log.error(`模板目录路径: ${templateDir}`)
    log.error(`templates 根目录: ${templatesDir}`)
    if (fs.existsSync(templatesDir)) {
      const availableTemplates = fs.readdirSync(templatesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      log.info(`可用的模板: ${availableTemplates.join(', ')}`)
    }
    process.exit(1)
  }

  log.info(`正在创建项目 ${projectName}...`)
  copyDirSync(templateDir, targetDir)

  // 处理 .gitignore 文件（模板中可能使用 _gitignore 作为文件名）
  const gitignore = path.join(targetDir, '_gitignore')
  if (fs.existsSync(gitignore)) {
    fs.renameSync(gitignore, path.join(targetDir, '.gitignore'))
  }

  log.success('项目创建成功 🎉')
}
