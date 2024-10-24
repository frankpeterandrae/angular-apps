/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Route } from '@angular/router';
import { environment } from '@angular-apps/config';
import { EnvGuard } from '@angular-apps/services';

const devRoutes: Route[] = [
	{
		path: 'dev/paint-rack',
		loadComponent: () => import('@angular-apps/colour-rack').then((m) => m.ColorSearchContainerComponent),
		canActivate: [EnvGuard],
	},
	{
		path: 'dev/test',
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.Error404Component),
		canActivate: [EnvGuard],
	},
	// Add more dev-specific routes here
];

export const appRoutes: Route[] = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{
		path: 'home',
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.HomeComponent),
	},
	...(environment.production ? [] : devRoutes),
	{
		path: '**',
		loadComponent: () => import('@angular-apps/homepage-feature').then((m) => m.Error404Component),
	},
];
