import fs from 'node:fs'
import process from 'node:process'
import colors from 'picocolors'

/**
 * Validates if a string is a valid npm package name. (验证字符串是否为合法的 npm 包名)
 * @param name - The package name to validate. (待验证的包名)
 * @returns True if the name is valid, false otherwise. (合法返回 true，否则返回 false)
 */
export function isValidPackageName(name: string): boolean {
  return /^[a-z0-9._-]+$/.test(name)
}

/**
 * Normalizes the target directory path. (规范化目标目录路径)
 * @param targetDir - The raw directory path string. (原始的目录路径字符串)
 * @returns The formatted directory path. (格式化后的标准目录路径)
 */
export function formatTargetDir(targetDir: string): string {
  return targetDir.trim().replace(/\/+$/g, '')
}

/**
 * Checks for existence, handles overwrite logic, or exits the process if conflicted. (检查目录是否存在、处理覆盖逻辑或退出进程)
 * @param targetDir - The target path of the directory. (目标目录路径)
 * @param overwrite - Whether to force overwrite the existing directory. (是否允许强制覆盖)
 */
export async function prepareTargetDir(targetDir: string, overwrite: boolean) {
  if (!fs.existsSync(targetDir)) return

  if (!overwrite) {
    console.log(`\n${colors.red(`Error: The directory "${targetDir}" already exists.`)}`)
    console.log(`Use ${colors.cyan('-f')} or ${colors.cyan('--overwrite')} to force removal.\n`)
    process.exit(1)
  }

  // console.log(`${colors.yellow('! ')}Removing existing directory "${path.basename(targetDir)}"...\n`);
  await fs.promises.rm(targetDir, { recursive: true, force: true })
}
