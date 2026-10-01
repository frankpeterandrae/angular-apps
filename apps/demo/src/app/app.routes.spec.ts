/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { appRoutes } from './app.routes';

describe('appRoutes', () => {
	it('should redirect the root route to the button demo', () => {
		const route = appRoutes.find(({ path }) => path === '');

		expect(route?.redirectTo).toBe('demo/button');
		expect(route?.pathMatch).toBe('full');
	});

	it('should lazy load the demo feature', () => {
		const route = appRoutes.find(({ path }) => path === 'demo');

		expect(route?.loadChildren).toBeTypeOf('function');
	});
});
