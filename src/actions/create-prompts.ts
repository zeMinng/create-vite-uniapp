import * as p from '@clack/prompts'
import colors from 'picocolors'
import { 
  DEFAULT_PROJECT_NAME,
  PROMPTS_OPTIONS,
} from '../constants'

export async function getProjectInfo(initialName: string) {
  p.intro(colors.bgCyan(colors.black(` ${DEFAULT_PROJECT_NAME} `)))

  const result = await p.group(
    {
      projectName: () => 
        p.text({
          message: 'Project name:',
          placeholder: DEFAULT_PROJECT_NAME,
          initialValue: initialName || DEFAULT_PROJECT_NAME,
          validate: (value) => {
            if (value.length === 0) return 'Project name is required!';
          }
        }),
      // extract globally defined interactive questions
      ...Object.fromEntries(
        Object.entries(PROMPTS_OPTIONS).map(([key, config]) => [
          key,
          () => (p as any)[config.type](config)
        ])
      )
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.')
        process.exit(0)
      },
    }
  )

  return result
}
