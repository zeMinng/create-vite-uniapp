import fs from 'node:fs'
import path from 'node:path'
// import { spawn } from 'node:child_process'
import process from 'node:process'
import colors from 'picocolors'
import { getProjectInfo } from './create-prompts'
import { renderTemplate } from './template-manager'
import { TEMPLATE_ROOT, BASE_TEMPLATE_PATH } from '../constants'
import { getPkgManager } from '../utils/env'

export interface CreateOptions {
  install?: boolean;
  overwrite?: boolean
}
export async function createProject(
  name: string,
  options: CreateOptions = {},
) {
  const { 
    install = true,
    overwrite = false
  } = options

  // check if a directory with the same name exists
  const targetPath = path.resolve(process.cwd(), name)
  await prepareTargetDir(targetPath, overwrite)

  // collect project creation information
  const result = await getProjectInfo(name)
  const { projectName, isTypeScript, needsEslint } = result
  const targetDir = path.resolve(process.cwd(), projectName)

  // create project
  const templateRoot = TEMPLATE_ROOT
  renderTemplate(BASE_TEMPLATE_PATH, targetDir)
  const variant = isTypeScript ? 'ts' : 'js'
  renderTemplate(path.join(templateRoot, 'variants', variant), targetDir)

  // create lint
  if (needsEslint) {
    const eslintRoot = path.join(templateRoot, 'features', 'eslint')
    // Step 1:  Base
    renderTemplate(path.join(eslintRoot, 'base'), targetDir)
    // Step 2: Core
    renderTemplate(path.join(eslintRoot, 'core', variant), targetDir)
  }

  // install dependencies
  if (install) {
    installDependencies(targetDir)
  }
}


/**
 * check for existence handle overwrite logic or exit the process
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


async function installDependencies(targetDir: string) {
  const pkgManager = getPkgManager()
  // not writing for now
  try {
    // await spawn(pkgManager, ['install'], {
    //   cwd: targetDir,
    //   stdio: 'inherit',
    //   shell: true,
    // })
  } catch (e) {
  }
}