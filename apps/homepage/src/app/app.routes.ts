import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{
		path: 'home',
		loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
	},
	{
		path: 'paint-rack',
		loadComponent: () => import('@angular-apps/colour-rack').then((m) => m.ColorSearchContainerComponent),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'home',
	},
	{
		path: '*',
		redirectTo: 'home',
	},
];
