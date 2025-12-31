import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getProjectInfo } from '../prompts.js'
import { log } from '../utils/logger.js'

/**
 * 获取项目根目录（包含 templates 目录的目录）
 */
function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url)
  let currentDir = path.dirname(currentFile)

  // 从当前文件位置向上查找，直到找到包含 templates 目录的目录
  while (currentDir !== path.dirname(currentDir)) {
    const templatesPath = path.join(currentDir, 'templates')
    if (fs.existsSync(templatesPath)) {
      return currentDir
    }
    currentDir = path.dirname(currentDir)
  }

  // 如果找不到，回退到从 dist 目录向上查找
  const distDir = path.dirname(currentFile)
  if (distDir.includes('dist')) {
    return path.resolve(distDir, '..')
  }

  throw new Error('无法找到项目根目录')
}

const templatesDir = path.join(getProjectRoot(), 'templates')

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
