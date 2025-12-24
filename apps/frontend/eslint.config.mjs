import baseConfig from '../../eslint.config.mjs'
import vue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'

/**
 * Frontend ESLint 配置
 * 继承根目录配置，添加 Vue 相关规则
 */
export default [
  ...baseConfig,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    files: ['*.ts', '*.tsx', '*.mts', '*.cts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['*.mjs', '*.cjs', '*.js'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
  {
    files: [
      'capacitor.config.ts',
      'electron/main.ts',
      'electron/preload.ts',
      'pwa-assets.config.ts',
      'vitest.config.ts',
      'vite.config.ts',
    ],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      // 关闭与 Prettier 冲突的格式规则
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  {
    ignores: ['dist', 'dist-electron', 'node_modules'],
  },
]
