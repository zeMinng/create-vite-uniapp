import path from 'node:path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'
import mri from 'mri'
import colors from 'picocolors'
import { createProject } from './actions/create.js'
import { log } from './utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const argv = mri<{
  template?: string
  help?: boolean
  overwrite?: boolean
  immediate?: boolean
  version?: boolean
}>(process.argv.slice(2), {
  boolean: ['help', 'overwrite', 'immediate', 'version'],
  alias: { h: 'help', t: 'template', f: 'overwrite', i: 'immediate', v: 'version' },
  string: ['template'],
})

function printHelp() {
  console.log(`
  ${colors.cyan(colors.bold('create-vite-uniapp: quickly create a uniapp project'))}

  ${colors.bold('Usage:')}
    npm create vite-uniapp@latest [project-name] [options]

  ${colors.bold('Options:')}
    -t, --template      ${colors.dim('specify template (default: vue3-ts)')}
    -f, --overwrite     ${colors.dim('if the directory already exists overwrite it')}
    -i, --immediate     ${colors.dim('skip dependency installation')}
    -h, --help          ${colors.dim('show help information')}
    -v, --version       ${colors.dim('show version number')}

  ${colors.bold('Example:')}
    npm create vite-uniapp@latest
    npm create vite-uniapp@latest vite-uniapp

    ${colors.gray('# force overwrite target file (强制覆盖目标文件)')}
    npm create vite-uniapp@latest vite-uniapp -f

    ${colors.gray('# create a project but skip installing dependencies (创建项目但跳过依赖安装)')}
    npm create vite-uniapp@latest vite-uniapp -t vue3-ts -i
`)
}

function getVersion() {
  const pkgPath = path.resolve(__dirname, '../package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  return pkg.version
}

async function init() {
  // show help information
  if (argv.help) {
    printHelp()
    return
  }
  // show version information
  if (argv.version) {
    console.log(`${colors.cyan('create-vite-uniapp:')} ${colors.green('v' + getVersion())}`)
    return
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('%c [ argv ]-47', 'font-size:13px; background:pink; color:#bf2c9f;', argv)
  }

  const argTargetDir = argv._[0]
  ? formatTargetDir(String(argv._[0]))
  : undefined
  const argTemplate = argv.template
  const argOverwrite = argv.overwrite
  const argImmediate = argv.immediate

  // if a project name is specified please check if it already exists
  if (argTargetDir) {
    const targetPath = path.resolve(process.cwd(), argTargetDir)
    if (fs.existsSync(targetPath)) {
      if (!argOverwrite) {
        log.error(`the directory "${argTargetDir}" already exists`)
        log.info('use the -f/--overwrite  option to overwrite the existing directory')
        process.exit(1)
      } else {
        log.warning(`the directory "${argTargetDir}" already exists and will be overwritten`)
        // recursively delete directory
        fs.rmSync(targetPath, { recursive: true, force: true })
      }
    }
  }

  try {
    // 创建项目
    await createProject(argTargetDir, {
      template: argTemplate,
    })

    // 如果指定了目标目录，显示下一步操作
    if (argTargetDir) {
      log.step(`下一步操作:`)
      console.log(`  cd ${argTargetDir}`)
      if (!argImmediate) {
        console.log(`  npm install`)
      }
      console.log(`  npm run dev`)
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error(error.message)
    } else {
      log.error('创建项目时发生未知错误')
    }
    process.exit(1)
  }
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, '')
}

init().catch((e) => {
  console.error(e)
  process.exit(1)
})
