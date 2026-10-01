/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { BaseComponent, LOGGER_SOURCE, Scopes, TranslationDirective, TranslationPipe } from '@application-platform/shared-ui';
import { provideTranslocoScope, translateSignal } from '@jsverse/transloco';

import { i18nTextModules } from '../../i18n/i18n';

/** Displays the homepage hero content. */
@Component({
	selector: 'homepage-feature-intro',
	templateUrl: './home-intro.component.html',
	styleUrl: './home-intro.component.scss',
	imports: [TranslationDirective, TranslationPipe],
	providers: [{ provide: LOGGER_SOURCE, useValue: 'HomeIntroComponent' }, provideTranslocoScope(Scopes.HOMEPAGE_FEATURE)]
})
export class HomeIntroComponent extends BaseComponent {
	protected readonly i18nTextModules = i18nTextModules;

	protected readonly paragraph = translateSignal(i18nTextModules.HomeIntroComponent.lbl.Paragraph1);
}
