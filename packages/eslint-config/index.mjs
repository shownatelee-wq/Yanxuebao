import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ignores = [
  '**/.next/**',
  '**/dist/**',
  '**/coverage/**',
  '**/node_modules/**',
  '**/next-env.d.ts',
];

export default [
  {
    ignores,
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: [
      'apps/admin-web/**/*.{js,jsx,ts,tsx}',
      'apps/device-shell/**/*.{js,jsx,ts,tsx}',
      'apps/expert-web/**/*.{js,jsx,ts,tsx}',
      'apps/parent-web/**/*.{js,jsx,ts,tsx}',
      'apps/tutor-web/**/*.{js,jsx,ts,tsx}',
    ],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];
