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
		provideFastSVG({ url: (name: string) => `assets/svg-assets/${name}.svg` }),
	],
};