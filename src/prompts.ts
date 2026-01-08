import * as prompts from '@clack/prompts'
import colors from 'picocolors'
import { isValidPackageName } from './utils/validate.js'

export type ProjectLanguage = 'js' | 'ts'

export interface ProjectFeatures {
  /** 是否启用 ESLint 支持（包含 Vue + TS 规则） */
  eslint: boolean
}

export interface ProjectInfo {
  name: string
  language: ProjectLanguage
  features: ProjectFeatures
}

export async function getProjectInfo(
  defaultName?: string
): Promise<ProjectInfo> {
  prompts.intro(colors.bgCyan(colors.black(' create-uniapp ')))

  // 1. ask for the project name first
  const projectName = await prompts.text({
    message: 'what is the name of the project:',
    initialValue: defaultName || 'vite-uniapp',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'project name cannot be empty'
      }
      if (!isValidPackageName(value)) {
        return 'the project name format is incorrect. Only letters, numbers, hyphens and underscores are allowed'
      }
      return
    },
  })

  if (prompts.isCancel(projectName)) {
    prompts.cancel('operation canceled')
    process.exit(0)
  }

  // 2. 询问使用 JS 还是 TS
  const language = await prompts.select<ProjectLanguage>({
    message: 'select project language:',
    options: [
      { value: 'ts', label: 'TypeScript', hint: 'recommend' },
      { value: 'js', label: 'JavaScript' },
    ],
    initialValue: 'ts',
  })

  if (prompts.isCancel(language)) {
    prompts.cancel('operation canceled')
    process.exit(0)
  }

  // 3. 询问是否启用 ESLint（后续可继续在这里追加更多特性）
  const enableEslint = await prompts.confirm({
    message: 'enable es lint including vue and type script rules:',
    initialValue: true,
  })

  if (prompts.isCancel(enableEslint)) {
    prompts.cancel('operation canceled')
    process.exit(0)
  }

  return {
    name: String(projectName).trim(),
    language,
    features: {
      eslint: !!enableEslint,
    },
  }
}
