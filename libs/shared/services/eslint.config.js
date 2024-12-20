/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

module.exports = [
	...baseConfig,
	...nx.configs['flat/angular'],
	...nx.configs['flat/angular-template'],
	{
		files: ['**/*.ts'],
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'sharedServices',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'shared-services',
					style: 'kebab-case',
				},
			],
			'@angular-eslint/pipe-prefix': [
				'error',
				{
					prefixes: ['fpa'],
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		// Override or add rules here
		rules: {},
	},
];
