import prettier from 'eslint-config-prettier';

// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';
import svelteParser from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */
export default [
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }]
		}
	},

	{
		// Plain TypeScript modules (services, contracts, utils)
		files: ['**/*.ts'],
		languageOptions: { parser: tsParser }
	},
	{
		// Core no-unused-vars false-positives on TS interface/type signatures —
		// contracts are declaration-only modules, so the rule has nothing real to catch.
		files: ['**/contracts/**/*.ts', '**/*.d.ts'],
		rules: { 'no-unused-vars': 'off' }
	},
	{
		// Svelte components + rune-enabled modules (.svelte.ts overrides the plain TS block above)
		files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				svelteConfig
			}
		}
	},
	...storybook.configs['flat/recommended']
];
