import mri from 'mri'
import colors from 'picocolors'
import { printHelp, printCliMsg, printVersion } from './cli/info'
import { DEFAULT_PROJECT_NAME } from './constants'
import { formatTargetDir } from './utils/validate'
import { createProject } from './core/create'

const argv = mri<{
  help?: boolean
  version?: boolean
  overwrite?: boolean
  yes?: boolean
  install?: boolean
  git?: boolean
}>(process.argv.slice(2), {
  boolean: ['help', 'version', 'overwrite', 'yes', 'install', 'git'],
  alias: { h: 'help', v: 'version', f: 'overwrite', y: 'yes', i: 'install', g: 'git' },
})

async function init() {
  // show help and version information
  if (argv.help) return printHelp()
  if (argv.version) return printVersion()
  console.log(printCliMsg.welcome)

  const argTargetDir = formatTargetDir(String(argv._[0] || DEFAULT_PROJECT_NAME))

  try {
    const { overwrite, install, git, yes } = argv

    // Example usage: npm create vite-uniapp@latest my-vite-uniapp -y --no-install
    // --no-install flag: Skip automatic dependency installation
    await createProject(argTargetDir, { overwrite, install, git, yes })
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
