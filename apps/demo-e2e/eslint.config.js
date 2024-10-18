/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');
const js = require('@eslint/js');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

module.exports = [
	...baseConfig,
	...compat.extends('plugin:cypress/recommended'),
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {},
	},
	{
		files: ['**/*.js', '**/*.jsx'],
		rules: {},
	},
	{
		files: ['src/**/*.{ts,js,tsx,jsx}'],
		rules: {},
	},
];
