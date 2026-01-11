# create-vite-uniapp

[![npm version](https://img.shields.io/npm/v/create-vite-uniapp?color=42b883&logo=npm)](https://www.npmjs.com/package/create-vite-uniapp)
[![downloads](https://img.shields.io/npm/dw/create-vite-uniapp?color=42b883&logo=vuedotjs&logoColor=white)](https://npmjs.com/package/create-vite-uniapp)
[![node compatibility](https://img.shields.io/node/v/create-vite-uniapp?color=42b883&logo=nodedotjs&logoColor=white)](https://nodejs.org/en/about/previous-releases)
[![license](https://img.shields.io/github/license/zeMinng/create-vite-uniapp?color=42b883)](./LICENSE)

一个基于 Vite 的极速 uni-app 项目脚手架工具。旨在提供比官方模板更现代、更轻量、更易扩展的开发体验。

## 🛠️ 快速开始

```bash
# 使用 npm
npm create vite-uniapp@latest

# 使用 pnpm
pnpm create vite-uniapp
```

## 📖 使用指南

直接运行命令并按照提示操作，或直接指定选项：

```bash
# 交互式模式
npm create vite-uniapp@latest

# 指定项目名称
npm create vite-uniapp@latest my-app -i -f -v -h
```

## 📁 项目结构

```
my-app/
├── src/
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   └── pages/           # 页面目录
│       └── index/
│           └── index.vue
├── index.html           # HTML 模板
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

## 🤝 贡献

欢迎贡献代码！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m '添加一些 AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Uni-app](https://uniapp.dcloud.net.cn/) - 跨平台应用框架
