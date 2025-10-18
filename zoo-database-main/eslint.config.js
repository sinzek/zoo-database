import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import nodePlugin from 'eslint-plugin-n';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
	globalIgnores(['dist', 'node_modules', 'build', 'coverage']),

	// --- Config files ---
	{
		files: ['main/api/**/*.js'],
		extends: [
			js.configs.recommended,
			nodePlugin.configs['flat/recommended'],
		],
		languageOptions: {
			globals: globals.node,
		},
	},

	// --- React/Main app ---
	{
		files: ['main/**/*.{js,jsx}'],
		extends: [
			js.configs.recommended,
			react.configs.flat.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
			prettier,
		],
		languageOptions: {
			ecmaVersion: 'latest',
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		rules: {
			'no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			eqeqeq: ['error', 'always'],
			'no-var': 'error',
			'prefer-const': 'error',
			'no-debugger': 'warn',
		},
	},
]);
