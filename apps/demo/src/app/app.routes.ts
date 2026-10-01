/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Routes } from '@angular/router';

export const appRoutes: Routes = [
	{ path: '', redirectTo: 'demo/button', pathMatch: 'full' },
	{ path: 'demo', loadChildren: () => import('@application-platform/demo-feature').then((m) => m.demoFeatureRoutes) }
];
