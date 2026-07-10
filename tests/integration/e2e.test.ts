import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, test, expect, beforeAll } from 'vitest'
import { execa } from 'execa'
import { discoverPlugins } from '@/core/plugins'
import { renderTemplate } from '@/core/render'
import { getCombinations } from './utils'
import type { ProjectInfoResult } from '@/types'

const E2E_TEMP_DIR = path.resolve(__dirname, '../../.e2e-temp')

describe('E2E Template Generation and Build', () => {
  const plugins = discoverPlugins().map(p => p.name)
  const combinations = getCombinations(plugins)

  // 构建测试矩阵
  const testMatrix: { name: string; isTypeScript: boolean; plugins: string[] }[] = []
  for (const combo of combinations) {
    const pluginsStr = combo.length > 0 ? combo.join('-') : 'base'
    testMatrix.push({ name: `ts-${pluginsStr}`, isTypeScript: true, plugins: combo })
    testMatrix.push({ name: `js-${pluginsStr}`, isTypeScript: false, plugins: combo })
  }

  beforeAll(async () => {
    // 1. 清理并重新创建临时根目录
    await fs.rm(E2E_TEMP_DIR, { recursive: true, force: true })
    await fs.mkdir(E2E_TEMP_DIR, { recursive: true })

    const allDeps: Record<string, string> = {}
    const allDevDeps: Record<string, string> = {}

    // 2. 预先一次性生成所有模板，并收集所有依赖项
    for (const item of testMatrix) {
      const targetDir = path.join(E2E_TEMP_DIR, item.name)
      const projectInfo: ProjectInfoResult = {
        projectName: item.name,
        isTypeScript: item.isTypeScript,
        plugins: item.plugins,
        install: false,
        git: false,
      }

      // 执行渲染生成物理隔离的项目结构
      await renderTemplate(targetDir, projectInfo)

      // 读取并合并依赖
      const pkgPath = path.join(targetDir, 'package.json')
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
      Object.assign(allDeps, pkg.dependencies || {})
      Object.assign(allDevDeps, pkg.devDependencies || {})
    }

    // 3. 在临时根目录下生成一个聚合的 package.json
    const masterPkg = {
      name: 'e2e-master-dependencies',
      private: true,
      dependencies: allDeps,
      devDependencies: allDevDeps,
    }
    await fs.writeFile(
      path.join(E2E_TEMP_DIR, 'package.json'),
      JSON.stringify(masterPkg, null, 2),
      'utf-8'
    )

    // 4. 在根目录下【只执行一次】全局依赖安装，榨干 npm 缓存优化
    const installResult = await execa('npm', [
      'install',
      '--ignore-scripts',
      '--prefer-offline', // 优先读取本地缓存，不走网络请求
      '--no-audit',       // 关闭安全审计，加快速度
      '--no-fund'         // 关闭捐赠提示
    ], { 
      cwd: E2E_TEMP_DIR 
    })

    if (installResult.exitCode !== 0) {
      throw new Error(`Global E2E npm install failed:\n${installResult.stderr}`)
    }

    // 5. 为 16 个子项目批量创建 node_modules 软链接
    // 提示：因为 GitHub CI 是 Linux (ubuntu-latest)，fs.symlink 极为稳定高效
    const globalNodeModules = path.join(E2E_TEMP_DIR, 'node_modules')
    const linkType = process.platform === 'win32' ? 'junction' : 'dir'

    for (const item of testMatrix) {
      const targetDir = path.join(E2E_TEMP_DIR, item.name)
      const subNodeModules = path.join(targetDir, 'node_modules')
      
      // 使用绝对路径 globalNodeModules，并传入判断好的 linkType
      await fs.symlink(globalNodeModules, subNodeModules, linkType)
    }
  }, 300000) // 给 beforeAll 留足 5 分钟宽裕时间（实际上 1 分钟左右就能跑完）

  // 【核心修改】这里移除 .concurrent，在 CI 上必须严格串行排队构建
  // 因为 16 个项目共享一个 node_modules，并发 build 会引发缓存和 CPU 冲突
  test.each(testMatrix)('should verify and build $name', async ({ name, isTypeScript }) => {
    const targetDir = path.join(E2E_TEMP_DIR, name)
    const pkgPath = path.join(targetDir, 'package.json')

    // 1. 验证 package.json 是否存在
    const pkgExists = await fs.access(pkgPath).then(() => true).catch(() => false)
    expect(pkgExists).toBe(true)

    // 2. 执行构建 (此时通过软链直接共享根目录的 vite 和依赖)
    const buildResult = await execa('npm', ['run', 'build:h5'], { 
      cwd: targetDir,
      reject: false 
    })
    if (buildResult.exitCode !== 0) {
      console.error(`Build:h5 failed for ${name}:\n`, buildResult.stderr || buildResult.stdout)
    }
    expect(buildResult.exitCode).toBe(0)

    // 3. 如果是 TypeScript，运行类型检查
    if (isTypeScript) {
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
      if (pkg.scripts && pkg.scripts['typecheck']) {
        const tcResult = await execa('npm', ['run', 'typecheck'], { 
          cwd: targetDir,
          reject: false 
        })
        if (tcResult.exitCode !== 0) {
          console.error(`Typecheck failed for ${name}:\n`, tcResult.stderr || tcResult.stdout)
        }
        expect(tcResult.exitCode).toBe(0)
      }
    }
  }, 60000) // 单个项目只进行 build，耗时极短，60 秒绝对够用
})