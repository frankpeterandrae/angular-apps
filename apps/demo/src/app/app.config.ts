/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(appRoutes), provideHttpClient()],
};
