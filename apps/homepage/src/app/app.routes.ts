/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Routes } from '@angular/router';
import { EnvGuard, Scopes } from '@application-platform/shared-ui';
import { provideTranslocoScope } from '@jsverse/transloco';

import { environment } from '../environments/environment';

const devRoutes: Routes = [
	{
		path: 'dev',
		children: [
			{
				path: 'test',
				loadComponent: () => import('@application-platform/homepage-feature').then((m) => m.Error404Component),
				canActivate: [EnvGuard]
			},
			{
				path: 'demo',
				loadChildren: () => import('@application-platform/demo-feature').then((m) => m.demoFeatureRoutes)
			}
		]
	}
];

export const appRoutes: Routes = [
	{
		path: '',
		loadComponent: () => import('@application-platform/homepage-feature').then((m) => m.HomeComponent)
	},
	{
		path: 'paint-rack',
		loadComponent: () => import('@application-platform/colour-rack').then((m) => m.ColorSearchContainerComponent),
		providers: [provideTranslocoScope(Scopes.COLOUR_RACK)]
	},
	...(environment.production ? [] : devRoutes),
	{
		path: '**',
		loadComponent: () => import('@application-platform/homepage-feature').then((m) => m.Error404Component)
	}
];
