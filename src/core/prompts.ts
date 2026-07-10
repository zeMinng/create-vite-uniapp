import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import * as prompts from '@clack/prompts'
import colors from 'picocolors'
import { DEFAULT_PROJECT_NAME } from '../constants'
import { prepareTargetDir, isValidPackageName } from '../utils/validate'
import type { ProjectInfoResult } from '../types'
import { discoverPlugins } from './plugins'

export async function getProjectInfo(
  options: {
    name: string
    targetPath: string
    overwrite?: boolean
    yes?: boolean
  },
): Promise<ProjectInfoResult> {
  const { name, targetPath, overwrite = false, yes = false } = options
  
  prompts.intro(colors.bgCyan(colors.black(` ${name ?? DEFAULT_PROJECT_NAME} `)))

  // 1. check if a directory with the same name exists. (检查同名目录是否存在)
  await checkPathConflict(targetPath, overwrite)

  // -y mode: skip all prompts, use defaults (-y 模式：跳过所有问答使用默认值)
  if (yes) {
    const targetDir = path.resolve(process.cwd(), name ?? DEFAULT_PROJECT_NAME)
    if (fs.existsSync(targetDir)) {
      const s = prompts.spinner()
      s.start(`Removing existing directory "${path.basename(targetDir)}"...`)
      await prepareTargetDir(targetDir, true)
      s.stop(`Removed existing directory "${path.basename(targetDir)}"`)
    }
    return {
      projectName: name ?? DEFAULT_PROJECT_NAME,
      isTypeScript: true,
      plugins: [],
      install: false,
      git: false,
    }
  }

  // 2. interactive prompt. (交互式询问)
  const result = await prompts.group({
    projectName: () => prompts.text({
      message: 'Project name:',
      placeholder: DEFAULT_PROJECT_NAME,
      initialValue: name ?? DEFAULT_PROJECT_NAME,
      validate: (value?: string) => {
        if (!value?.trim()) return 'Project name is required'
        if (!isValidPackageName(value)) return 'Invalid package name'
      },
    }),

    isTypeScript: () => prompts.select({
      message: 'Pick a language:',
      options: [
        { value: true, label: 'TypeScript', hint: 'recommended' },
        { value: false, label: 'JavaScript' },
      ],
      initialValue: true,
    }),

    plugins: () => {
      const availablePlugins = discoverPlugins()
      if (availablePlugins.length === 0) {
        return Promise.resolve([])
      }
      return prompts.multiselect({
        message: 'Select optional features:',
        options: availablePlugins.map(p => ({
          value: p.name,
          label: p.display,
          hint: p.description,
        })),
        required: false,
      })
    },

    install: () => prompts.confirm({
      message: 'Install dependencies?',
      initialValue: false,
    }).then((v: boolean | symbol) => v),

    git: () => prompts.confirm({
      message: 'Initialize Git repository?',
      initialValue: true,
    }).then((v: boolean | symbol) => v),
  }, {
    onCancel: () => {
      prompts.cancel('Operation cancelled.')
      process.exit(0)
    }
  })

  // 3. Delete Old Directory.  (在 outro 前删除旧目录，保持交互视觉连贯)
  const targetDir = path.resolve(process.cwd(), result.projectName)
  if (fs.existsSync(targetDir)) {
    const s = prompts.spinner()
    s.start(`Removing existing directory "${path.basename(targetDir)}"...`)
    await prepareTargetDir(targetDir, true)
    // await new Promise(r => setTimeout(r, 1500))
    s.stop(`Removed existing directory "${path.basename(targetDir)}"`)
  }

  return result as ProjectInfoResult
}

/**
 * Check path conflict, exit if exists & no overwrite. (检查目标路径冲突，如果冲突且不覆盖则直接终止程序)
 * @param targetPath Target path
 * @param overwrite Allow overwrite flag
 */
async function checkPathConflict(targetPath: string, overwrite: boolean) {
  if (fs.existsSync(targetPath) && !overwrite) {
    const confirmed = await prompts.confirm({
      message: `Target directory "${path.basename(targetPath)}" already exists. Overwrite?`,
      initialValue: false,
    })

    if (prompts.isCancel(confirmed) || !confirmed) {
      prompts.cancel('Operation cancelled.')
      process.exit(0)
    }
  }
}