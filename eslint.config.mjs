import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // React-Compiler rules from the newer react-hooks plugin: keep as warnings
      // (these flag intentional, working patterns — ref access, setState-in-effect).
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      // One blank line after every statement (verbatim from the reference config).
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['const', 'let', 'var', 'if', 'class', 'function', 'block'], next: ['*'] },
        { blankLine: 'always', prev: ['*'], next: ['const', 'let', 'var', 'if', 'class', 'function', 'block', 'return'] },
      ],
      // Auto-sortable, deterministic import/export ordering. Groups adapted to
      // this project's relative-import layout (react/packages → app → relative).
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // side-effect imports
            ['^react', '^react-native$', '^@?\\w'], // react, then other packages
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // relative
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // Catch circular dependencies (direct A→B→A).
      'import/no-cycle': ['error', { maxDepth: 1 }],
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: true,
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      },
    },
  },
  { ignores: ['node_modules/', 'dist/', '.expo/'] },
];
