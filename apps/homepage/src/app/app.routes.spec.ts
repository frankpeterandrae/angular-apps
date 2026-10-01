/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { environment } from '../environments/environment';

import { appRoutes } from './app.routes';

describe('appRoutes', () => {
	it('should lazy load the homepage', () => {
		const route = appRoutes.find(({ path }) => path === '');

		expect(route?.loadComponent).toBeTypeOf('function');
	});

	it('should configure the paint rack route with scoped providers', () => {
		const route = appRoutes.find(({ path }) => path === 'paint-rack');

		expect(route?.loadComponent).toBeTypeOf('function');
		expect(route?.providers).toBeDefined();
	});

	it('should expose development routes only outside production', () => {
		const route = appRoutes.find(({ path }) => path === 'dev');

		expect(Boolean(route)).toBe(!environment.production);
	});

	it('should lazy load the not-found page for unknown routes', () => {
		const route = appRoutes.find(({ path }) => path === '**');

		expect(route?.loadComponent).toBeTypeOf('function');
	});
});
