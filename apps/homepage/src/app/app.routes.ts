/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

/**
 * Import necessary modules and services.
 */
import { Route } from '@angular/router';
import { environment } from '@angular-apps/config';
import { EnvGuard } from '@angular-apps/services';

/**
 * Development-specific routes.
 * These routes are only included when the application is not in production mode.
 */
const devRoutes: Route[] = [
	{
		path: 'dev/paint-rack',
		/**
		 * Lazy loads the ColorSearchContainerComponent for the paint rack route.
		 * @returns {Promise<any>} A promise that resolves to the ColorSearchContainerComponent.
		 */
		loadComponent: () => import('@angular-apps/colour-rack').then((m) => m.ColorSearchContainerComponent),
		/**
		 * Guards the route to ensure it is only accessible in the appropriate environment.
		 */
		canActivate: [EnvGuard],
	},
	{
		path: 'dev/test',
		/**
		 * /**
		 * Lazy loads the Error404Component for the test route.
		 * @returns {Promise<any>} A promise that resolves to the Error404Component.
		 */
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.Error404Component),
		canActivate: [EnvGuard],
	},
	// Add more dev-specific routes here
];

/**
 * Application routes.
 * Includes the main routes for the application and conditionally includes development routes.
 */
export const appRoutes: Route[] = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{
		path: 'home',
		/**
		 * /**
		 * Lazy loads the HomeComponent for the home route.
		 * @returns {Promise<any>} A promise that resolves to the HomeComponent.
		 */
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.HomeComponent),
	},
	...(environment.production ? [] : devRoutes),
	{
		path: '**',
		/**
		 * /**
		 * Lazy loads the Error404Component for handling unknown routes.
		 * @returns {Promise<any>} A promise that resolves to the Error404Component.
		 */
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.Error404Component),
	},
];
