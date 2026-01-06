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

  // 1. 先询问项目名称
  const projectName = await prompts.text({
    message: '项目名称是什么？',
    initialValue: defaultName || 'my-uniapp',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return '项目名称不能为空'
      }
      if (!isValidPackageName(value)) {
        return '项目名称格式不正确，只能包含小写字母、数字、连字符和下划线'
      }
      return
    },
  })

  if (prompts.isCancel(projectName)) {
    prompts.cancel('操作已取消')
    process.exit(0)
  }

  // 2. 询问使用 JS 还是 TS
  const language = await prompts.select<ProjectLanguage>({
    message: '选择项目语言',
    options: [
      { value: 'ts', label: 'TypeScript', hint: '推荐' },
      { value: 'js', label: 'JavaScript' },
    ],
    initialValue: 'ts',
  })

  if (prompts.isCancel(language)) {
    prompts.cancel('操作已取消')
    process.exit(0)
  }

  // 3. 询问是否启用 ESLint（后续可继续在这里追加更多特性）
  const enableEslint = await prompts.confirm({
    message: '是否启用 ESLint（包含 Vue + TypeScript 规则）？',
    initialValue: true,
  })

  if (prompts.isCancel(enableEslint)) {
    prompts.cancel('操作已取消')
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
