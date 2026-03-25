/** @type {import('eslint').Linter.Config[]} */
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  // Ignorados globales
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/prisma/**',
      '**/infra/stress-lab/**',
      '**/scripts/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/tailwind.config.*',
      '**/postcss.config.*'
    ]
  },

  // Configuración base para JavaScript
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        es2022: true
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'off'
    }
  },

  // Configuración específica para frontend TypeScript
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './frontend/tsconfig.json', // 👈 Ruta específica al frontend
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        browser: true,
        node: true,
        es2022: true,
        React: true
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@next/next': nextPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@next/next/no-html-link-for-pages': ['error', 'frontend/src/app'], // 👈 Ruta específica
      '@next/next/no-img-element': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      },
      next: {
        rootDir: 'frontend' // 👈 Directorio raíz de Next.js
      }
    }
  },

  // Configuración para backend TypeScript
  {
    files: ['backend/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './backend/tsconfig.json', // 👈 Ruta específica al backend
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        node: true,
        es2022: true
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Permitir console.log en backend
      'prefer-const': 'error'
    }
  },

  // Configuración para archivos de configuración (sin TypeScript)
  {
    files: [
      'frontend/tailwind.config.{js,ts}',
      'frontend/postcss.config.{js,ts}',
      'frontend/next.config.{js,ts}',
      'backend/prisma.config.ts',
      '**/.eslintrc.{js,json}'
    ],
    languageOptions: {
      sourceType: 'script',
      globals: {
        module: true,
        require: true,
        __dirname: true
      }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off'
    }
  }
]
