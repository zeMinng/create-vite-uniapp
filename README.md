# create-vite-uniapp

[![npm version](https://img.shields.io/npm/v/create-vite-uniapp?color=42b883&logo=npm)](https://www.npmjs.com/package/create-vite-uniapp)
[![downloads](https://img.shields.io/npm/dw/create-vite-uniapp?color=42b883&logo=vuedotjs&logoColor=white)](https://npmjs.com/package/create-vite-uniapp)
[![node compatibility](https://img.shields.io/node/v/create-vite-uniapp?color=42b883&logo=nodedotjs&logoColor=white)](https://nodejs.org/en/about/previous-releases)
[![license](https://img.shields.io/github/license/zeMinng/create-vite-uniapp?color=42b883)](./LICENSE)

A lightning-fast CLI for scaffolding uni-app projects powered by Vite. Designed to provide a more modern, lightweight, and extensible development experience than standard templates.

## 🛠️ Quick Start

```bash
# Using npm
npm create vite-uniapp@latest

# Using pnpm
pnpm create vite-uniapp
```

## 📖 Usage

Run the command and follow the prompts, or specify options directly:

```bash
# Interactive mode
npm create vite-uniapp@latest

# With project name
npm create vite-uniapp@latest my-app

# With template
npm create vite-uniapp@latest my-app --template vue3-ts
```

## 📁 Project Structure

```
my-app/
├── src/
│   ├── App.vue          # Root component
│   ├── main.ts          # Entry point
│   └── pages/           # Pages directory
│       └── index/
│           └── index.vue
├── index.html           # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Uni-app](https://uniapp.dcloud.net.cn/) - Cross-platform application framework
