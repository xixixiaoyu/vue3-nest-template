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
      },
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
