import { spawn } from 'node:child_process'
import * as prompts from '@clack/prompts'
import { getPkgManager } from '../utils/env'

/**
 * Execute a command in the specified directory.
 * (在指定目录中执行命令)
 */
function exec(command: string, args: string[], options: { cwd: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore', ...options, shell: true })
    child.on('close', (code: number | null) => {
      if (code !== 0) reject(new Error(`Command failed: ${command} ${args.join(' ')}`))
      else resolve()
    })
  })
}

/**
 * Install dependencies in the target directory using the detected package manager.
 * (在目标目录中使用检测到的包管理器安装依赖) 
 */
export async function installDependencies(targetDir: string): Promise<boolean> {
  const pm = getPkgManager()
  const s = prompts.spinner()
  s.start(`Installing dependencies with ${pm}...`)
  try {
    await exec(pm, ['install'], { cwd: targetDir })
    s.stop(`Dependencies installed`)
    return true
  } catch {
    s.stop(`Failed to install dependencies`)
    console.log(`  Run \`${pm} install\` manually.`)
    return false
  }
}
