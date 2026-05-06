import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
    ],
  },
  /** 自定义规则 */
  {
    files: ['src/**/*.{ts,js,vue}'],
    rules: {
      // 禁用代码结尾分号
      'semi': ['error', 'never'],
      // 使用单引号
      'quotes': ['error', 'single', {
        'avoidEscape': true,  // 允许在字符串中使用双引号来避免转义
        'allowTemplateLiterals': true  // 允许使用模板字符串
      }],
      // 关闭原生 no-unused-vars
      'no-unused-vars': 'off',
      // 使用 TS 版 no-unused-vars，并忽略 _ 前缀
      '@typescript-eslint/no-unused-vars': ['warn', {
        args: 'all',
        argsIgnorePattern: '^_',
        vars: 'all',
        varsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_'
      }],
      // 是否可以空函数
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      'jsx-quotes': ['error', 'prefer-double'],
      // 是否多单词组件名称
      'vue/multi-word-component-names': 'off',
    },
  }
])