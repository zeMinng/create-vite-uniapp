import { execSync } from 'node:child_process'

/**
 * Initialize a Git repository in the target directory and make the initial commit.
 * (在目标目录中初始化 Git 仓库并进行首次提交，git 不可用时静默跳过)
 */
export async function initGitRepo(targetDir: string): Promise<boolean> {
  try {
    execSync('git --version', { stdio: 'ignore' })
    execSync('git init', { cwd: targetDir, stdio: 'ignore' })
    execSync('git add -A', { cwd: targetDir, stdio: 'ignore' })
    execSync('git commit -m "chore: initial commit from create-vite-uniapp"',
      { cwd: targetDir, stdio: 'ignore' })
    return true
  } catch { return false }
}
