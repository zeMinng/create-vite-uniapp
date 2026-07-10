import path from 'node:path'
import process from 'node:process'
import * as prompts from '@clack/prompts'
import colors from 'picocolors'
import { checkForUpdates } from '../cli/update'
import { getProjectInfo } from './prompts'
import { renderTemplate } from './render'
import { initGitRepo } from './git'
import { installDependencies } from './package-manager'
import { printCliMsg } from '../cli/info'
import { getPkgManager } from '../utils/env'

export interface CLIOptions {
  overwrite?: boolean
  install?: boolean
  git?: boolean
  yes?: boolean
}

export async function createProject(name: string, options: CLIOptions = {}) {
  // 1. Check for updates. (检查版本更新,非阻塞不等待结果)
  const updatePromise = checkForUpdates()

  // 2. check if a directory with the same name exists. (交互式收集项目信息)
  const targetPath = path.resolve(process.cwd(), name)
  const { overwrite = false, install, git, yes } = options
  const result = await getProjectInfo({ name, targetPath, overwrite, yes })

  // If install / git passed via CLI, override prompt results. (or cli options install / git? 覆盖 prompts 的结果)
  if (install !== undefined) {
    result.install = install
  }
  if (git !== undefined) {
    result.git = git
  }

  // 3. Render template. (渲染模板)
  const targetDir = path.resolve(process.cwd(), result.projectName)
  await renderTemplate(targetDir, result)

  // 4. init git. (初始化git)
  if (result.git) {
    await initGitRepo(targetDir)
  }

  // 5. install. (安装依赖)
  let installSucceeded = false
  if (result.install) {
    installSucceeded = await installDependencies(targetDir)
  }

  // 6. outro. (完成提示)
  const pkgManager = getPkgManager()
  prompts.outro(colors.green('Setup complete!'))
  console.log(printCliMsg.finishing(result.projectName))
  console.log(printCliMsg.nextSteps(result.projectName, pkgManager, installSucceeded))

  // 7. check for updates. (如果有新版本，打印更新提示)
  const latestVersion = await updatePromise
  if (latestVersion) {
    console.log(`\n  Update available: ${latestVersion}`)
  }
}
