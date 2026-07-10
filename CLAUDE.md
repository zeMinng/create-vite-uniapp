# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

`create-vite-uniapp` 是一个用于快速搭建 UniApp + Vite 项目的 CLI 脚手架工具，类似 `create-vite` 但专为 UniApp 设计。通过 `npm create vite-uniapp@latest` 使用。

## 技术栈

- **Runtime**: Node >= 20, 纯 ESM (`"type": "module"`)
- **TypeScript**: 编译目标 ES2023, moduleResolution: bundler
- **构建工具**: [tsdown](https://github.com/hyoban/tsdown) — 基于 Rolldown 的 TS 打包器
- **测试框架**: [Vitest](https://vitest.dev/)
- **CLI 参数解析**: `mri` (轻量 minimist 替代)
- **交互式提示**: `@clack/prompts`
- **终端样式**: `picocolors`

## 常用命令

```bash
npm run dev          # tsdown --watch (开发模式监听构建)
npm run build        # tsdown 生产构建 (输出 dist/, 含 minify + dts)
npm run typecheck    # tsc --noEmit (仅类型检查)
npm run test         # 运行 Vitest 单元测试
npm run release      # standard-version 自动打 tag + 推送
```

## 架构

```text
index.js                    # Shebang 入口, 直接 re-export dist/index.js
src/
├── index.ts                # CLI 主入口: mri 解析参数 → 调用 core 的逻辑
├── cli/
│   ├── info.ts             # --help 输出和 --version 显示
│   └── update-checker.ts   # 检查 CLI 更新
├── constants/
│   └── index.ts            # 默认值、交互配置、消息文本等
├── core/
│   ├── create.ts           # 项目创建核心流程
│   ├── git.ts              # Git 仓库初始化操作
│   ├── package-manager.ts  # 包管理器相关逻辑
│   ├── plugins.ts          # 插件相关逻辑
│   ├── prompts.ts          # 交互式提示相关逻辑
│   └── render/             # 模板渲染逻辑
├── types.ts                # 全局类型定义
└── utils/
    ├── env.ts              # 环境检测
    └── validate.ts         # 名称校验与路径格式化
templates/                  # 模板文件目录
├── base/                   # 基础模板
├── language/               # 语言模板 (JS/TS)
└── plugins/                # 各种插件模板 (Pinia/Unocss 等)
```

## 关键设计点

- **构建输出**: `src/index.ts` 为 tsdown 唯一入口，输出 ESM 到 `dist/`。`index.js` 是 npm bin 的实际入口，只做 `import './dist/index.js'`。
- **`@pkg` 路径别名**: tsconfig 中将 `@pkg` 映射到 `./package.json`，用于在 `src/cli/info.ts` 中读取版本号。
- **`package.json` 依赖注意**: `@clack/prompts` 和 `mri` 当前在 `devDependencies` 中，因为 tsdown 会将它们打包进 `dist/`。**不要移到 `dependencies`**，除非改为 external 不打包。
- **模板系统**: 基础模板在 `templates/base/`，通过 `TEMPLATE_ROOT` 常量引用。`prompts.ts` 中的 `getProjectInfo` 会基于用户交互选择，配合 `render` 逻辑来决定最终模板组合。
- **`templates/` 通过 npm `files` 发布**: package.json 中 `files: ["index.js", "templates", "dist"]` 确保模板随包发布。

## 注意事项

- 构建输出是打包的 ESM bundle（dependencies 打入 dist，非 external），所以运行时不需要 `node_modules`。
- 新增功能或模板时，确保同步更新相关的 type 定义和 core 层逻辑。
