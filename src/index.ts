import path from 'node:path'
import fs from 'node:fs'
import mri from 'mri'
import colors from 'picocolors'
import { createProject } from './actions/create.js'
import { log } from './utils/logger.js'

const argv = mri<{
  template?: string
  help?: boolean
  overwrite?: boolean
  immediate?: boolean
  version?: boolean
}>(process.argv.slice(2), {
  boolean: ['help', 'overwrite', 'version'],
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

  ${colors.bold('Example:')}
    npm create vite-uniapp@latest
    npm create vite-uniapp@latest vite-uniapp
    npm create vite-uniapp@latest vite-uniapp --template vue3-ts
    npm create vite-uniapp@latest vite-uniapp --overwrite
`)
}

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined
  const argTemplate = argv.template
  const argOverwrite = argv.overwrite
  const argImmediate = argv.immediate

  // 显示帮助信息
  if (argv.help) {
    printHelp()
    return
  }

  // 如果指定了目标目录，检查是否已存在
  if (argTargetDir) {
    const targetPath = path.resolve(process.cwd(), argTargetDir)
    if (fs.existsSync(targetPath)) {
      if (!argOverwrite) {
        log.error(`目录 "${argTargetDir}" 已存在`)
        log.info('使用 --overwrite 选项来覆盖现有目录')
        process.exit(1)
      } else {
        log.warning(`目录 "${argTargetDir}" 已存在，将被覆盖`)
        // 递归删除目录
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
