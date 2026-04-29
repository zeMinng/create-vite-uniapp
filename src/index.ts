import mri from 'mri'
import colors from 'picocolors'
import { DEFAULT_PROJECT_NAME, MESSAGES } from './constants'
import { formatTargetDir } from './utils/validate'
import { getPkgManager } from './utils/env'
import { printHelp, getVersion } from './cli/info'
import { createProject } from './actions/create'

const argv = mri<{
  template?: string
  overwrite?: boolean
  help?: boolean
  version?: boolean
}>(process.argv.slice(2), {
  string: ['template'],
  boolean: ['help', 'overwrite', 'version'],
  alias: { h: 'help', t: 'template', f: 'overwrite', v: 'version' },
})

async function init() {
  // show help and version information
  if (argv.help) { printHelp(); return; }
  if (argv.version) { getVersion(true); return; }
  console.log(MESSAGES.welcome)

  const argTargetDir = argv._[0] ? formatTargetDir(String(argv._[0])) : DEFAULT_PROJECT_NAME
  const argOverwrite = argv.overwrite

  try {
    const createdName = await createProject(argTargetDir, {
      overwrite: argOverwrite,
    })

    // conclusion and guidance
    const pkgManager = getPkgManager()
    console.log(MESSAGES.finishing(createdName))
    console.log(MESSAGES.nextSteps(createdName, pkgManager))
  } catch (error) {
    if (error instanceof Error) {
      console.log(`\n${colors.red(`Error: ${error.message}`)}`)
    } else {
      console.log(`\n${colors.red('an unknown error occurred while creating the project')}`)
    }
    process.exit(1)
  }
}

init().catch((e) => {
  console.error(e)
  process.exit(1)
})
