import path from 'node:path'
import fs from 'node:fs'
import mri from 'mri'
import colors from 'picocolors'
import { printHelp, getVersion } from './cli/info'
import { createProject } from './actions/create'

const argv = mri<{
  template?: string
  help?: boolean
  overwrite?: boolean
  install?: boolean
  version?: boolean
}>(process.argv.slice(2), {
  boolean: ['help', 'overwrite', 'install', 'version'],
  alias: { h: 'help', t: 'template', f: 'overwrite', i: 'install', v: 'version' },
  string: ['template'],
})

async function init() {
  // show help information
  if (argv.help) {
    printHelp()
    return
  }
  // show version information
  if (argv.version) {
    getVersion(true)
    return
  }

  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined
  const argTemplate = argv.template
  const argOverwrite = argv.overwrite
  const argInstall= argv.install

  // if a project name is specified please check if it already exists
  if (argTargetDir) {
    const targetPath = path.resolve(process.cwd(), argTargetDir)
    if (fs.existsSync(targetPath)) {
      if (!argOverwrite) {
        console.log(`\n${colors.red(`Error: The directory "${argTargetDir}" already exists.`)}`)
        console.log(`Use ${colors.cyan('-f')} or ${colors.cyan('--overwrite')} to force removal.\n`)
        process.exit(1)
      } else {
        console.log(`${colors.yellow('! ')}Removing existing directory "${argTargetDir}"...`)
        // recursively delete directory
        fs.rmSync(targetPath, { recursive: true, force: true })
      }
    }
  }

  try {
    await createProject(argTargetDir, {
      template: argTemplate,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.log(`\n${colors.red(`Error: ${error.message}`)}`)
    } else {
      console.log(`\n${colors.red('an unknown error occurred while creating the project')}`)
    }
    process.exit(1)
  }

  // conclusion and guidance
  const pkgManager = getPkgManager()
  const nextSteps = [
    argTargetDir && `cd ${argTargetDir}`,
    argInstall && `${pkgManager} install`, 
    `${pkgManager} run dev`
  ].filter(Boolean)
  console.log('Done. Next steps:')
  console.log(nextSteps.join('\n'))
}

function getPkgManager() {
  const userAgent = process.env.npm_config_user_agent
  if (userAgent) {
    if (userAgent.startsWith('yarn')) return 'yarn'
    if (userAgent.startsWith('pnpm')) return 'pnpm'
    if (userAgent.startsWith('bun')) return 'bun'
  }
  return 'npm'
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, '')
}

init().catch((e) => {
  console.error(e)
  process.exit(1)
})
