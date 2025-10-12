import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import nodePlugin from 'eslint-plugin-n';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
	globalIgnores(['dist', 'node_modules', 'build', 'coverage']),

	// --- frontend ---
	{
		files: ['main/**/*.{js,jsx}'],
		extends: [
			js.configs.recommended,
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
			'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
		},
	},

	// --- backend ---
	{
		files: ['backend/**/*.{js,jsx}'],
		extends: [js.configs.recommended, 'plugin:n/recommended', prettier],
		languageOptions: {
			ecmaVersion: 'latest',
			globals: globals.node,
			parserOptions: {
				sourceType: 'module',
			},
		},
		plugins: {
			n: nodePlugin,
		},
		rules: {
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'n/no-missing-import': 'error',
			'n/no-unpublished-import': 'off',
		},
	},

	// --- shared rules ---
	{
		files: ['**/*.{js,jsx}'],
		rules: {
			eqeqeq: ['error', 'always'],
			'no-var': 'error',
			'prefer-const': 'error',
			'no-debugger': 'warn',
		},
	},
]);
