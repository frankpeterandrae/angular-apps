/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { LOGGER_SOURCE, Scopes, TranslationDirective } from '@application-platform/shared-ui';
import { provideTranslocoScope } from '@jsverse/transloco';

import { i18nTextModules } from '../../../i18n/i18n';

/**
 * Displays the application footer.
 */
@Component({
	selector: 'theme-footer',
	imports: [TranslationDirective],
	templateUrl: './footer.component.html',
	providers: [{ provide: LOGGER_SOURCE, useValue: 'FooterComponent' }, provideTranslocoScope(Scopes.THEME)]
})
export class FooterComponent {
	public readonly i18nTextModules = i18nTextModules;
}
