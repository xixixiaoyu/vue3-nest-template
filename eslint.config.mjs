import js from '@eslint/js'
import ts from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/**
 * 根目录通用 ESLint 配置
 * 前后端继承此配置
 */
export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['**/dist', '**/node_modules', '**/*.js', '**/*.cjs'],
  },
]
