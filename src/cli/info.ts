import colors from 'picocolors'
import cliPackageJson from '@pkg' with { type: 'json' }

/**
 * get the version of the CLI (获取 CLI 的版本)
 */
export const getPackageName = (): string => cliPackageJson.name
export const getVersion = (): string => cliPackageJson.version
export const printVersion = (): void => console.log(`v${getVersion()}`)

/**
 * terminal welcome and closing remarks (终端欢迎语和结束语)
 */
export const printCliMsg = {
  welcome: `\n${colors.magenta('🚀 Welcome to create-vite-uniapp!')}\n`,
  finishing: (dir: string) => `\n${colors.green('✨ Project created in')} ${colors.cyan(dir)}\n`,
  nextSteps: (name: string, pkgManager: string, installSucceeded: boolean = false) => `
  ${colors.yellow('Next steps:')}
    cd ${name}${installSucceeded ? '' : `\n    ${pkgManager} install`}
    ${pkgManager} run dev
  `
}

/**
 * print help information (打印帮助信息)
 */
export function printHelp(): void {
  console.log(`
  ${colors.cyan(colors.bold('create-vite-uniapp: quickly create a uniapp project.'))}

  ${colors.bold('Usage:')}
    npm create vite-uniapp@latest [project-name] [options]

  ${colors.bold('Options:')}
    -f, --overwrite     ${colors.dim('if the directory already exists overwrite it')}
    -i, --install       ${colors.dim('install dependencies (use --no-install to skip)')}
    -g, --git           ${colors.dim('initialize Git repository (use --no-git to skip)')}
    -y, --yes           ${colors.dim('skip prompts and use defaults')}
    -h, --help          ${colors.dim('show help information')}
    -v, --version       ${colors.dim('show version number')}

  ${colors.bold('Example:')}
    npm create vite-uniapp@latest my-vite-uniapp -y --no-install --no-git
  `.trim())
}