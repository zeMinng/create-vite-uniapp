import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'
import colors from 'picocolors'
import { getProjectInfo } from './create-prompts'
import type { TemplateVariant } from '../templates/registry'
import { resolveTemplateLayers } from '../templates/resolve'
import { applyTemplateLayers } from '../templates/render'
import { getPkgManager } from '../utils/env'

export interface CreateOptions {
  install?: boolean;
  overwrite?: boolean
}

/**
 * create project function
 * @param name project name. default is `my-vite-uniapp` (项目名称，默认为 `my-vite-uniapp`)
 * @param options create options. from CLI flags (创建选项，来自 CLI 标志)
 * @returns the final project name (最终项目名称)
 * @description
 * 1. collect project information through interactive prompts (通过交互式提示收集项目信息)
 * 2. check for existence handle overwrite logic or exit the process (检查存在性并处理覆盖逻辑或退出进程)
 * 3. create project (base -> variant -> optional features) (创建项目(基础 -> 变体 -> 可选特性))
 * 4. install dependencies (安装依赖)
 * 5. return the final project name (返回最终项目名称)
 */
export async function createProject(
  name: string,
  options: CreateOptions = {},
): Promise<string> {
  const {
    overwrite = false
  } = options

  // collect project creation information
  const result = await getProjectInfo(name)
  const { projectName, isTypeScript, immediateInstall } = result
  const targetDir = path.resolve(process.cwd(), projectName)

  // Check based on the final interactive projectName
  await prepareTargetDir(targetDir, overwrite)

  // create project (base -> variant -> optional features)
  const variant: TemplateVariant = isTypeScript ? 'ts' : 'js'
  const layers = resolveTemplateLayers({ variant, ...result })
  applyTemplateLayers(layers, targetDir, { projectName })

  // install dependencies
  if (immediateInstall) {
    await installDependencies(targetDir)
  }

  return projectName
}


/**
 * check for existence handle overwrite logic or exit the process. (检查存在性并处理覆盖逻辑或退出进程)
 * @param targetDir target path
 * @param overwrite overwrite?
 */
async function prepareTargetDir(targetDir: string, overwrite: boolean) {
  if (!fs.existsSync(targetDir)) return

  if (!overwrite) {
    console.log(`\n${colors.red(`Error: The directory "${targetDir}" already exists.`)}`)
    console.log(`Use ${colors.cyan('-f')} or ${colors.cyan('--overwrite')} to force removal.\n`)
    process.exit(1)
  }

  console.log(`${colors.yellow('! ')}Removing existing directory "${path.basename(targetDir)}"...`);
  fs.rmSync(targetDir, { recursive: true, force: true }) // fs.promises.rm
}


/**
 * install dependencies in the target directory. (在目标目录安装依赖)
 * @param targetDir target path. (目标路径)
 * @throws error if installation fails
 */
async function installDependencies(targetDir: string) {
  const pkgManager = getPkgManager()

  await new Promise<void>((resolve, reject) => {
    const child = spawn(pkgManager, ['install'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) return resolve()
      reject(new Error(`Failed to run "${pkgManager} install" (exit code: ${code ?? 'unknown'}).`))
    })
  })
}