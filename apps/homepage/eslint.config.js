/*
 * Copyright (c) 2024-2025. Frank-Peter Andrä
 * All rights reserved.
 */

const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');
const js = require('@eslint/js');
require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended
});

module.exports = [
	...baseConfig,
	...compat.config({ extends: ['plugin:@nx/angular', 'plugin:@angular-eslint/template/process-inline-templates'] }).map((config) => ({
		...config,
		files: ['**/*.ts'],
		rules: {
			...config.rules,
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'fpa',
					style: 'camelCase'
				}
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'fpa',
					style: 'kebab-case'
				}
			]
		}
	})),
	...compat.config({ extends: ['plugin:@nx/angular-template'] }).map((config) => ({
		...config,
		files: ['**/*.html'],
		rules: {
			...config.rules
		}
	})),
	{
		files: ['**/*.ts'],
		rules: {
			'@angular-eslint/prefer-standalone': 'off'
		}
	}
];
