/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{
		path: 'home',
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.HomeComponent),
	},
	{
		path: 'paint-rack',
		loadComponent: () => import('@angular-apps/colour-rack').then((m) => m.ColorSearchContainerComponent),
	},
	{
		path: '**',
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.Error404Component),
	},
];
