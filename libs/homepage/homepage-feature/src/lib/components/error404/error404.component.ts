/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonColorDefinition, ButtonComponent, CardComponent } from '@application-platform/shared/ui-theme';
import { BaseComponent, LOGGER_SOURCE, Scopes, TranslationDirective } from '@application-platform/shared-ui';
import { provideTranslocoScope, translateSignal } from '@jsverse/transloco';

import { i18nTextModules } from '../../i18n/i18n';

/** Displays the not-found page and provides navigation back home. */
@Component({
	selector: 'homepage-feature-error404',
	imports: [ButtonComponent, CardComponent, TranslationDirective],
	templateUrl: './error404.component.html',
	providers: [{ provide: LOGGER_SOURCE, useValue: 'Error404Component' }, provideTranslocoScope(Scopes.HOMEPAGE_FEATURE)]
})
export class Error404Component extends BaseComponent {
	private readonly router = inject(Router);
	protected readonly i18nTextModules = i18nTextModules;
	protected readonly ButtonColorDefinition = ButtonColorDefinition;
	protected readonly backToStart = translateSignal(i18nTextModules.Error404Component.lbl.BackToStartpage);

	protected async routeToHome(): Promise<void> {
		try {
			await this.router.navigate(['/']);
		} catch (error) {
			this.logger.error('Error while navigating to home page', error);
		}
	}
}
