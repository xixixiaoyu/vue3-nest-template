import baseConfig from '../../eslint.config.mjs'

/**
 * Backend ESLint 配置
 * 继承根目录配置，添加 NestJS 相关规则
 */
export default [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    ignores: ['dist', 'node_modules', 'prisma'],
  },
]
