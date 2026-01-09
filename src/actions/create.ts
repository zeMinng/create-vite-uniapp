import fs from 'node:fs'
import path from 'node:path'
import colors from 'picocolors'
import { getProjectInfo } from './create-prompts'

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
  console.log('%c [ result ]-27', 'font-size:13px; background:pink; color:#bf2c9f;', result)
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
