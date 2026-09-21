/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		/**
		 * Provides zone less change detection
		 */
		provideZonelessChangeDetection(),
		provideBrowserGlobalErrorListeners(),
		provideRouter(appRoutes)
	]
};
