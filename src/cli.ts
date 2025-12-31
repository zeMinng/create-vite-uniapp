import { cac } from 'cac'
import { version } from './utils/pkg.js'
import { createProject } from './actions/create.js'

const cli = cac('create-uniapp')

export function run() {
  cli
    .command('[project-name]', 'Create a new UniApp project')
    .option('--template <template>', 'Template name')
    .action((name, options) => {
      createProject(name, options)
    })

  cli.version(version)
  cli.help()
  cli.parse()
}
