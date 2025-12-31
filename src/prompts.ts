import prompts from 'prompts'

export async function getProjectInfo(defaultName?: string) {
  return prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: defaultName || 'uniapp-project'
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        { title: 'Vue3 + JavaScript', value: 'vue3-js' },
        { title: 'Vue3 + TypeScript', value: 'vue3-ts' }
      ]
    }
  ])
}
