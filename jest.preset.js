/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

const nxPreset = require('@nx/jest/preset').default;

module.exports = {
	...nxPreset,
	collectCoverage: true,
	coverageDirectory: '<rootDir>/coverage',
	coverageReporters: ['text', 'lcov', 'html'],
};
