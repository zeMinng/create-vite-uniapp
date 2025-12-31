import * as prompts from '@clack/prompts'
import colors from 'picocolors'
import { isValidPackageName } from './utils/validate.js'

const TEMPLATES = ['vue3-ts'] as const

export type Template = (typeof TEMPLATES)[number]

export interface ProjectInfo {
  name: string
  template: Template
}

export async function getProjectInfo(
  defaultName?: string
): Promise<ProjectInfo> {
  prompts.intro(colors.bgCyan(colors.black(' create-uniapp ')))

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

  const template = await prompts.select({
    message: '选择模板',
    options: [
      {
        value: 'vue3-ts',
        label: 'Vue 3 + TypeScript',
        hint: '推荐',
      },
    ],
    initialValue: 'vue3-ts' as Template,
  })

  if (prompts.isCancel(template)) {
    prompts.cancel('操作已取消')
    process.exit(0)
  }

  return {
    name: String(projectName).trim(),
    template: template as Template,
  }
}

