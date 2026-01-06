import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getProjectInfo, type ProjectFeatures, type ProjectLanguage } from '../prompts.js'
import { log } from '../utils/logger.js'

/**
 * 获取模板目录路径
 * 支持两种场景：
 * 1. 本地开发：从 dist/actions/create.js 向上查找项目根目录
 * 2. npm create：从包根目录（index.js 所在位置）查找 templates
 */
function getTemplatesDir(): string {
  const currentFile = fileURLToPath(import.meta.url)
  let currentDir = path.dirname(currentFile)

  // 场景1: 从当前文件位置向上查找，直到找到包含 templates 目录的目录
  while (currentDir !== path.dirname(currentDir)) {
    const templatesPath = path.join(currentDir, 'templates')
    if (fs.existsSync(templatesPath)) {
      return templatesPath
    }
    currentDir = path.dirname(currentDir)
  }

  // 场景2: npm create 场景 - 从 index.js 的位置查找（包根目录）
  // index.js 在包根目录，templates 也在包根目录
  // 需要从 dist/actions/create.js 向上找到包根目录
  const distDir = path.dirname(currentFile)
  if (distDir.includes('dist')) {
    // 从 dist/actions 向上到包根目录
    const packageRoot = path.resolve(distDir, '../..')
    const templatesPath = path.join(packageRoot, 'templates')
    if (fs.existsSync(templatesPath)) {
      return templatesPath
    }
  }

  // 场景3: 如果是在 node_modules 中（npm create 场景）
  // 尝试从当前文件向上查找 node_modules，然后找到包根目录
  let searchDir = currentFile
  while (searchDir !== path.dirname(searchDir)) {
    if (path.basename(searchDir) === 'node_modules') {
      // 在 node_modules 中找到包目录
      const packageDir = path.join(searchDir, 'create-vite-uniapp')
      const templatesPath = path.join(packageDir, 'templates')
      if (fs.existsSync(templatesPath)) {
        return templatesPath
      }
      break
    }
    searchDir = path.dirname(searchDir)
  }

  // 添加调试信息
  const errorMsg = [
    '无法找到模板目录。',
    `当前文件位置: ${currentFile}`,
    `已搜索到: ${currentDir}`,
    '请确保 templates 目录存在于包根目录。',
  ].join('\n')
  throw new Error(errorMsg)
}

const templatesDir = getTemplatesDir()

type PackageJSON = {
  name?: string
  version?: string
  private?: boolean
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

/**
 * 递归复制目录（同步）
 */
function copyDirSync(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * 合并 package.json（脚本、依赖做浅合并）
 */
function mergePackageJson(base: PackageJSON, extra: PackageJSON): PackageJSON {
  return {
    ...base,
    ...extra,
    scripts: {
      ...(base.scripts || {}),
      ...(extra.scripts || {}),
    },
    dependencies: {
      ...(base.dependencies || {}),
      ...(extra.dependencies || {}),
    },
    devDependencies: {
      ...(base.devDependencies || {}),
      ...(extra.devDependencies || {}),
    },
  }
}

/**
 * 应用 JS 运行时依赖（templates/features/js/package.json）
 * 作为所有语言的基础运行时（uni 相关依赖、构建脚本等）。
 */
function applyJsRuntime(targetDir: string, projectName: string) {
  const jsPkgPath = path.join(templatesDir, 'features', 'js', 'package.json')
  if (!fs.existsSync(jsPkgPath)) {
    log.warning('未找到 JS 运行时模板：features/js/package.json，将跳过运行时依赖合并')
    return
  }

  const targetPkgPath = path.join(targetDir, 'package.json')
  let targetPkg: PackageJSON = {}

  if (fs.existsSync(targetPkgPath)) {
    try {
      targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf-8')) as PackageJSON
    } catch {
      log.warning('目标项目 package.json 解析失败，将使用 JS 模板 package.json 作为基础')
    }
  }

  const jsPkg = JSON.parse(fs.readFileSync(jsPkgPath, 'utf-8')) as PackageJSON

  // 以 JS 模板为基础，覆盖 name 为项目名，并合并已有配置（如果有）
  const merged = mergePackageJson(jsPkg, targetPkg)
  merged.name = projectName

  fs.writeFileSync(targetPkgPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8')
  log.info('已应用 JS 运行时依赖到 package.json')
}

/**
 * 应用 TS 相关依赖（templates/features/ts/package.json）
 * 只包含 TS 工具链（typescript / vue-tsc / @vue/tsconfig 等）。
 */
function applyTsRuntime(targetDir: string) {
  const tsPkgPath = path.join(templatesDir, 'features', 'ts', 'package.json')
  if (!fs.existsSync(tsPkgPath)) {
    log.warning('未找到 TS 工具链模板：features/ts/package.json，将跳过 TS 依赖合并')
    return
  }

  const targetPkgPath = path.join(targetDir, 'package.json')
  let targetPkg: PackageJSON = {}

  if (fs.existsSync(targetPkgPath)) {
    try {
      targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf-8')) as PackageJSON
    } catch {
      log.warning('目标项目 package.json 解析失败，将使用 TS 模板 package.json 作为基础')
    }
  }

  const tsPkg = JSON.parse(fs.readFileSync(tsPkgPath, 'utf-8')) as PackageJSON

  const merged = mergePackageJson(targetPkg, tsPkg)
  fs.writeFileSync(targetPkgPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8')
  log.info('已应用 TS 工具链依赖到 package.json')
}

/**
 * 应用 TypeScript 相关配置文件（templates/features/ts/tsconfig.json）
 */
function applyTsFeature(targetDir: string) {
  const tsConfigSrc = path.join(templatesDir, 'features', 'ts', 'tsconfig.json')
  if (!fs.existsSync(tsConfigSrc)) {
    log.warning('未找到 TS 特性模板：features/ts/tsconfig.json，将跳过 TS 配置复制')
    return
  }

  const tsConfigDest = path.join(targetDir, 'tsconfig.json')
  fs.copyFileSync(tsConfigSrc, tsConfigDest)
  log.info('已应用 TypeScript 配置（tsconfig.json）')
}

/**
 * 根据语言复制对应的 src 内容（目前主要是 src/pages）
 * - JS:  templates/features/js/src -> <target>/src
 * - TS:  templates/features/ts/src -> <target>/src
 */
function applyLanguageSrc(language: ProjectLanguage, targetDir: string) {
  const srcDir =
    language === 'ts'
      ? path.join(templatesDir, 'features', 'ts', 'src')
      : path.join(templatesDir, 'features', 'js', 'src')

  if (!fs.existsSync(srcDir)) {
    log.warning(`未找到 ${language.toUpperCase()} 语言模板的 src 目录：${srcDir}，将跳过 src/pages 复制`)
    return
  }

  const targetSrcDir = path.join(targetDir, 'src')
  copyDirSync(srcDir, targetSrcDir)
  log.info(`已应用 ${language.toUpperCase()} 模板的 src（包括 src/pages）`)
}

/**
 * 针对当前模板应用额外的功能特性
 *
 * 目前的目录结构为：
 * - templates/base              // 基础 uni-app + Vite 项目骨架
 * - templates/features/ts       // TS 运行时依赖 + tsconfig
 * - templates/features/js       // JS 运行时依赖（预留）
 * - templates/features/eslint   // ESLint 及其扩展
 *
 * 模板名称仍然沿用 CLI 上的 `vue3-ts`，在内部映射到一组 feature 组合，
 * 这样既兼容 README/命令行，又能利用新的模板拆分结构。
 */
function applyTemplateFeatures(
  language: ProjectLanguage,
  targetDir: string,
  features: ProjectFeatures,
  projectName: string,
) {
  // 1. 所有语言都先合并 JS 运行时（uni 依赖 + 构建脚本）
  applyJsRuntime(targetDir, projectName)

  // 2. 复制对应语言的 src（主要是 src/pages）
  applyLanguageSrc(language, targetDir)

  // 3. TS 项目再叠加 TS 工具链 + tsconfig + ESLint（可选）
  if (language === 'ts') {
    applyTsRuntime(targetDir)
    applyTsFeature(targetDir)

    if (features.eslint) {
      applyEslintTsFeature(targetDir)
    }
  } else {
    // JS 项目暂不内置 ESLint 预设，后续可在此扩展 JS 专用规则
    if (features.eslint) {
      log.warning('当前 JS 模板暂未内置 ESLint 预设，可稍后手动添加 ESLint 配置')
    }
  }
}

/**
 * 应用 ESLint + Vue + TS 规则（templates/features/eslint）
 */
function applyEslintTsFeature(targetDir: string) {
  const eslintBasePkgPath = path.join(
    templatesDir,
    'features',
    'eslint',
    'base',
    'package.json',
  )
  const eslintTsPkgPath = path.join(
    templatesDir,
    'features',
    'eslint',
    'core',
    'ts',
    'package.json',
  )
  const eslintConfigSrc = path.join(
    templatesDir,
    'features',
    'eslint',
    'core',
    'ts',
    'eslint.config.mts',
  )

  const hasBasePkg = fs.existsSync(eslintBasePkgPath)
  const hasTsPkg = fs.existsSync(eslintTsPkgPath)
  const hasConfig = fs.existsSync(eslintConfigSrc)

  if (!hasBasePkg && !hasTsPkg && !hasConfig) {
    // 没有提供 ESLint 特性模板，静默跳过即可
    return
  }

  const targetPkgPath = path.join(targetDir, 'package.json')
  let targetPkg: PackageJSON = {}

  if (fs.existsSync(targetPkgPath)) {
    try {
      targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf-8')) as PackageJSON
    } catch {
      log.warning('目标项目 package.json 解析失败，将覆盖为 ESLint 模板提供的配置')
    }
  }

  if (hasBasePkg) {
    const eslintBasePkg = JSON.parse(
      fs.readFileSync(eslintBasePkgPath, 'utf-8'),
    ) as PackageJSON
    targetPkg = mergePackageJson(targetPkg, eslintBasePkg)
  }

  if (hasTsPkg) {
    const eslintTsPkg = JSON.parse(
      fs.readFileSync(eslintTsPkgPath, 'utf-8'),
    ) as PackageJSON
    targetPkg = mergePackageJson(targetPkg, eslintTsPkg)
  }

  if (hasBasePkg || hasTsPkg) {
    fs.writeFileSync(targetPkgPath, `${JSON.stringify(targetPkg, null, 2)}\n`, 'utf-8')
    log.info('已合并 ESLint 相关依赖及脚本到 package.json')
  }

  if (hasConfig) {
    const eslintConfigDest = path.join(targetDir, 'eslint.config.mts')
    fs.copyFileSync(eslintConfigSrc, eslintConfigDest)
    log.info('已复制 ESLint 配置文件 eslint.config.mts')
  }
}

export async function createProject(
  name?: string,
  options?: { template?: string }
) {
  let projectName: string
  let language: ProjectLanguage
  let features: ProjectFeatures = {
    eslint: true,
  }

  // 如果提供了名称和模板，跳过交互式提示
  if (name && options?.template) {
    projectName = name

    // CLI 模式下通过 --template 传入，进行简单归一化映射为语言
    const tpl = String(options.template).toLowerCase()
    if (tpl === 'js' || tpl === 'vue3-js' || tpl === 'javascript') {
      language = 'js'
    } else {
      // 默认都归到 TS 模板
      language = 'ts'
    }

    // 非交互模式下，默认启用 ESLint，保持行为“更完整”的体验
    features = { eslint: true }
  } else {
    // 否则使用交互式提示
    const result = await getProjectInfo(name)
    projectName = result.name
    language = result.language
    features = result.features
  }

  const targetDir = path.resolve(process.cwd(), projectName)
  const baseTemplateDir = path.resolve(templatesDir, 'base')

  if (!fs.existsSync(baseTemplateDir)) {
    log.error('未找到基础模板目录 "templates/base"')
    log.error(`当前 templates 根目录: ${templatesDir}`)
    process.exit(1)
  }

  log.info(`正在创建项目 ${projectName}...`)

  // 1. 复制基础模板骨架
  copyDirSync(baseTemplateDir, targetDir)

  // 2. 根据语言 + 用户选择的特性，应用对应的组合（JS 运行时、TS 工具链、TS 配置、ESLint 等）
  applyTemplateFeatures(language, targetDir, features, projectName)

  // 处理 .gitignore 文件（模板中可能使用 _gitignore 作为文件名）
  const gitignore = path.join(targetDir, '_gitignore')
  if (fs.existsSync(gitignore)) {
    fs.renameSync(gitignore, path.join(targetDir, '.gitignore'))
  }

  log.success('项目创建成功 🎉')
}
