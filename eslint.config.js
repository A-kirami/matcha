import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import unocss from '@unocss/eslint-config/flat'
import vueMacros from '@vue-macros/eslint-config'
import eslintPluginImportX from 'eslint-plugin-import-x'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  // tseslint.configs.recommendedTypeChecked,
  // tseslint.configs.stylisticTypeChecked,
  eslintPluginUnicorn.configs['flat/recommended'],
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  stylistic.configs['recommended-flat'],
  ...pluginVue.configs['flat/recommended'],
  unocss,
  vueMacros,
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '**/.husky',
      '**/scripts',
      '**/components/ui',
      '**/auto-import?(s).d.ts',
      '**/components.d.ts',
      '**/typed-router.d.ts',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaFeatures: {
          jsx: true,
        },
        // projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'object-shorthand': ['warn', 'always'],
      'array-callback-return': 'error',
      'camelcase': 'warn',
      'consistent-this': ['error', 'that'],
      'curly': 'error',
      'default-case': 'error',
      'default-case-last': 'error',
      'default-param-last': 'error',
      'dot-notation': 'error',
      'eqeqeq': 'error',
      'func-names': ['error', 'as-needed'],
      'guard-for-in': 'error',
      'new-cap': 'error',
      'no-await-in-loop': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-console': 'warn',
      'accessor-pairs': 'error',
      'no-undef': 'off',
      'no-alert': 'error',
      'no-eval': 'error',
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/newline-per-chained-call': ['warn', { ignoreChainWithDepth: 3 }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: true }],
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
        enforceForJSX: true,
      }],
      '@typescript-eslint/no-inferrable-types': ['warn', { ignoreParameters: true, ignoreProperties: true }],
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': ['error', { ignore: ['^virtual:', '^~(?!/).*'] }],
      'import-x/order': [
        'warn',
        {
          'groups': ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
          'newlines-between': 'always',
          'alphabetize': { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/newline-after-import': 'warn',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/numeric-separators-style': ['warn', { number: { groupLength: 4 } }],
    },
  },
  {
    files: ['*.vue', '**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'pascalCase',
        },
      ],
    },
  },
  {
    ignores: ['**/layouts'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
)
