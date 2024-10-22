/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideFastSVG } from '@push-based/ngx-fast-svg';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(appRoutes),
		provideHttpClient(),
		provideFastSVG({
			url: (name: string) => {
				console.log('name', name);
				return `/assets/svg-assets/${name}.svg`;
			},
		}),
	],
};
