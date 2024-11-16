/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TranslocoConfig, translocoConfig } from '@jsverse/transloco';
import { environment } from '../environments/environment';

export const translocoConfigFactory: TranslocoConfig = translocoConfig({
	availableLangs: ['en', 'de'],
	defaultLang: 'de',
	reRenderOnLangChange: true,
	prodMode: environment.production,
});
