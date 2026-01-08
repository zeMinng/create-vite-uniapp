import colors from 'picocolors'
import cliPackageJson from '@pkg' with { type: 'json' }

export function getVersion(showLog: boolean = false): string {
  const version = cliPackageJson.version
  if (showLog) {
    console.log(version)
  }
  return version
}

export function printHelp(): void {
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
    npm create vite-uniapp@latest vite-uniapp -t vue3-ts -f -i
  `.trim())
}
