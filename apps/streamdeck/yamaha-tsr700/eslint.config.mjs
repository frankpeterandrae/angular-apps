import angular from 'angular-eslint';

import baseConfig from '../../../eslint.config.mjs';

export default [
	...baseConfig,
	{
		files: ['**/*.html'],
		languageOptions: { parser: angular.templateParser }
	}
];
