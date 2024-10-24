/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{ path: '', redirectTo: 'button', pathMatch: 'full' },
	{
		path: 'button',
		/**
		 * Lazy loads the DemoButtonComponent from the demo-feature module.
		 * @returns {Promise<any>} A promise that resolves to the DemoButtonComponent.
		 */
		loadComponent: (): Promise<any> => import('@angular-apps/demo-feature').then((m) => m.ButtonDemoComponent),
	},
	{
		path: 'colors',
		/**
		 * Lazy loads the ColorsComponent from the demo-feature module.
		 * @returns {Promise<any>} A promise that resolves to the ColorsComponent.
		 */
		loadComponent: (): Promise<any> => import('@angular-apps/demo-feature').then((m) => m.ColorsComponent),
	},
	{
		path: 'icons',
		/**
		 * Lazy loads the IconsDemoComponent from the demo-feature module.
		 * @returns {Promise<any>} A promise that resolves to the IconsDemoComponent.
		 */
		loadComponent: (): Promise<any> => import('@angular-apps/demo-feature').then((m) => m.IconDemoComponent),
	},
	{
		path: 'typography',
		/**
		 * Lazy loads the TypographyComponent from the demo-feature module.
		 * @returns {Promise<any>} A promise that resolves to the TypographyComponent.
		 */
		loadComponent: (): Promise<any> => import('@angular-apps/demo-feature').then((m) => m.TypographyDemoComponent),
	},
];
