import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import nextConfig from 'eslint-config-next';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'build/**',
      'node_modules/**',
      'out/**',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...nextConfig,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@stylistic/indent': ['warn', 2],
      '@stylistic/type-annotation-spacing': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
      }],
      'arrow-spacing': 'warn',
      'comma-spacing': 'warn',
      'eol-last': 'warn',
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'warn',
      'jsx-quotes': ['warn', 'prefer-single'],
      'key-spacing': ['warn', {
        beforeColon: false,
      }],
      'keyword-spacing': 'warn',
      'no-multi-spaces': 'warn',
      'no-multiple-empty-lines': ['warn', {
        max: 1,
        maxBOF: 0,
        maxEOF: 0,
      }],
      'no-trailing-spaces': 'warn',
      'no-whitespace-before-property': 'warn',
      'object-curly-spacing': ['warn', 'always'],
      'padded-blocks': ['warn', 'never'],
      'padding-line-between-statements': ['warn', {
        blankLine: 'always',
        next: ['block', 'block-like', 'return'],
        prev: '*',
      }, {
        blankLine: 'always',
        next: '*',
        prev: ['block', 'block-like', 'const', 'import', 'let'],
      }, {
        blankLine: 'never',
        next: 'import',
        prev: 'import',
      }, {
        blankLine: 'any',
        next: ['const', 'let'],
        prev: ['const', 'let'],
      }],
      quotes: ['warn', 'single'],
      'react/jsx-tag-spacing': ['warn', {
        beforeSelfClosing: 'always',
      }],
      semi: 'warn',
      'semi-spacing': 'warn',
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': ['warn', {
        groups: [['^\\u0000', '^@?\\w', '^[^.]', '^\\.']],
      }],
      'sort-keys': 'warn',
      'space-infix-ops': 'warn',
    },
  }
];

export default eslintConfig;
