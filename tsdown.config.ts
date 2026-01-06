import { defineConfig } from 'tsdown'

export default defineConfig({
  // 入口文件
  entry: ['src/index.ts'],
  // 输出格式：CLI 现在主流都用 ESM ('module')
  format: ['esm'],
  // 目标环境：Node.js LTS 版本 (Node 18+ 支持 fetch 等原生 API，适合 CLI)
  target: 'node20',
  // 压缩
  minify: true,
  // 保留文件扩展名
  fixedExtension: false,
  // 清理产物：每次构建前清空 dist 目录
  clean: true,
  // 平台：指定为 node 环境，避免打包一些浏览器特有的补丁
  platform: 'node',
})
