import path from 'node:path'
import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import { getProjectInfo } from '../prompts.js'
import { log } from '../utils/logger.js'

const templatesDir = fileURLToPath(
  new URL('../../templates', import.meta.url)
)

export async function createProject(
  name?: string,
  options?: { template?: string }
) {
  const result = await getProjectInfo(name)

  const projectName = result.name
  const template = options?.template || result.template

  const targetDir = path.resolve(process.cwd(), projectName)
  const templateDir = path.resolve(templatesDir, template)

  if (!fs.existsSync(templateDir)) {
    log.error(`Template "${template}" not found.`)
    process.exit(1)
  }

  log.info(`Creating project in ${projectName}...`)
  fs.copySync(templateDir, targetDir)

  const gitignore = path.join(targetDir, '_gitignore')
  if (fs.existsSync(gitignore)) {
    fs.renameSync(gitignore, path.join(targetDir, '.gitignore'))
  }

  log.success('Project created successfully 🎉')
}
