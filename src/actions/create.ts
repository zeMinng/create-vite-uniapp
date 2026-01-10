import fs from 'node:fs'
import path from 'node:path'
import colors from 'picocolors'
import { getProjectInfo } from './create-prompts'
import { renderTemplate } from './template-manager'
import { TEMPLATE_ROOT, BASE_TEMPLATE_PATH, FRAMEWORKS } from '../constants'

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
