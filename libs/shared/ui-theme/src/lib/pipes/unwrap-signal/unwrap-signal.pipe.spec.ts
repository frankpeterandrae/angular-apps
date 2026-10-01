/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { signal } from '@angular/core';

import { UnwrapSignalPipe } from './unwrap-signal.pipe';

describe('UnwrapSignalPipe', () => {
	const pipe = new UnwrapSignalPipe();

	it('should return string values unchanged', () => {
		expect(pipe.transform('Home')).toBe('Home');
	});

	it('should unwrap signal values', () => {
		const value = signal('Home');

		expect(pipe.transform(value)).toBe('Home');

		value.set('Settings');

		expect(pipe.transform(value)).toBe('Settings');
	});
});
