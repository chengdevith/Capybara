import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Menu items, routes and detail tabs come only from the extension registry.
  // Pages (views) may therefore only be imported by extension registrations,
  // and only the router may add routes.
  {
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/extensions/**', 'src/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/views/*', '**/views/*'],
              message: 'Pages are wired through the extension registry (src/extensions). Register them there.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/router/**', 'src/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='addRoute']",
          message: 'Routes are added by src/router from route extensions only.',
        },
      ],
    },
  },
)
