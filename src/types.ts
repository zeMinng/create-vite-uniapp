/** 用户交互收集的项目信息 */
export interface ProjectInfoResult {
  projectName: string
  isTypeScript: boolean
  plugins: string[]       // 用户选中的插件名数组，如 ['eslint', 'pinia']
  install: boolean
  git: boolean
}
