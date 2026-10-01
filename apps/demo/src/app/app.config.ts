/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { provideHttpClient, withXhr } from '@angular/common/http';
import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { createTranslocoConfig } from '@application-platform/config';
import { ScopedTranslationServiceInterface } from '@application-platform/interfaces';
import { APP_ENVIRONMENT, ScopedTranslationService, TranslocoHttpLoader } from '@application-platform/shared-ui';
import { provideTransloco } from '@jsverse/transloco';
import { provideFastSVG } from '@push-based/ngx-fast-svg';

import { environment } from '../environments/environment';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(appRoutes),
		provideHttpClient(withXhr()),
		provideFastSVG({
			url: (path: string): string => (path.includes('/') ? `/assets/${path}.svg` : `/assets/svg/${path}.svg`)
		}),
		provideTransloco({
			config: createTranslocoConfig(environment.production),
			loader: TranslocoHttpLoader
		}),
		{
			provide: ScopedTranslationServiceInterface,
			useClass: ScopedTranslationService
		},
		{
			provide: APP_ENVIRONMENT,
			useValue: environment
		}
	]
};
