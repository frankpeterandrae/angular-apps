const { FlatCompat } = require('@eslint/eslintrc');
const nxEslintPlugin = require('@nx/eslint-plugin');
const js = require('@eslint/js');

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

module.exports = [
	{ plugins: { '@nx': nxEslintPlugin } },
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: [],
					depConstraints: [
						{
							sourceTag: 'type:app',
							onlyDependOnLibsWithTags: ['type:api', 'type:feature', 'type:ui', 'type:domain-logic', 'type:util'],
						},
						{
							sourceTag: 'type:api',
							onlyDependOnLibsWithTags: ['type:ui', 'type:domain-logic', 'type:util'],
						},
						{
							sourceTag: 'type:feature',
							onlyDependOnLibsWithTags: ['type:ui', 'type:domain-logic', 'type:util'],
						},
						{
							sourceTag: 'type:ui',
							onlyDependOnLibsWithTags: ['type:domain-logic', 'type:util'],
						},
						{
							sourceTag: 'type:domain-logic',
							onlyDependOnLibsWithTags: ['type:util'],
						},
						{
							sourceTag: 'domain:shared',
							onlyDependOnLibsWithTags: ['domain:shared'],
						},
						{
							sourceTag: 'domain:homepage',
							onlyDependOnLibsWithTags: ['domain:homepage', 'domain:shared'],
						},
						{
							sourceTag: 'domain:demo',
							onlyDependOnLibsWithTags: ['domain:demo', 'domain:shared'],
						},
					],
				},
			],
		},
	},
	...compat.config({ extends: ['plugin:@nx/typescript'] }).map((config) => ({
		...config,
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			...config.rules,
			'@/no-extra-semi': 'error',
			'no-extra-semi': 'off',
		},
	})),
	...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
		...config,
		files: ['**/*.js', '**/*.jsx'],
		rules: {
			...config.rules,
			'@/no-extra-semi': 'error',
			'no-extra-semi': 'off',
		},
	})),
	...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
		...config,
		files: ['**/*.config.js'],
		rules: {
			...config.rules,
			'@/no-extra-semi': 'error',
			'no-extra-semi': 'off',
			'@typescript-eslint/no-require-imports': 'off',
		},
	})),
	...compat.config({ env: { jest: true } }).map((config) => ({
		...config,
		files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
		rules: {
			...config.rules,
		},
	})),
];
