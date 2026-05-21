/** @type {import('eslint').Linter.Config[]} */
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  // Configuración global de ignores - DEBE ESTAR AL PRINCIPIO
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/infra/**',
      '**/scripts/**',
      '**/*.config.*',
      '**/.git/**',
      '**/coverage/**',
      '**/.vercel/**',
      '**/*.js.map',
      '**/*.d.ts',
      '**/.eslintcache'
    ]
  },

  // BACKEND (TypeScript)
  {
    files: ['backend/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './backend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        allowAutomaticSingleRunInference: true
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'prefer-const': 'error'
    }
  },

  // FRONTEND (Next.js + TypeScript)
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './frontend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@next/next/no-html-link-for-pages': ['error', 'frontend/src/app'],
      '@next/next/no-img-element': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error'
    },
    settings: {
      next: {
        rootDir: 'frontend'
      }
    }
  },

  // JavaScript files (solo archivos JS, excluye TS)
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off',
      'prefer-const': 'error'
    }
  },

  // Archivos de configuración (excluidos de TypeScript)
  {
    files: ['*.config.{js,mjs,cjs,ts}'],
    languageOptions: {
      sourceType: 'module'
    }
  }
]
