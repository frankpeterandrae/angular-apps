/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, computed, inject } from '@angular/core';
import { ScopedTranslationServiceInterface } from '@application-platform/interfaces';
import { Scopes, TranslationPipe } from '@application-platform/shared-ui';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

import { IconDefinition } from '../../../enums';
import { i18nTextModules } from '../../../i18n/i18n';

/**
 * Toggles the active application language.
 */
@Component({
	selector: 'theme-language-toggle',
	imports: [FastSvgComponent, TranslationPipe],
	templateUrl: './language-toggle.component.html'
})
export class LanguageToggleComponent {
	private readonly translationService = inject(ScopedTranslationServiceInterface);

	protected readonly IconDefinition = IconDefinition;
	protected readonly Scopes = Scopes;
	protected readonly i18nTextModules = i18nTextModules;

	public readonly language = this.translationService.currentLang;

	protected readonly ariaLabelKey = computed(() =>
		this.language() === 'de'
			? i18nTextModules.LanguageToggleComponent.lbl.SwitchToEnglish
			: i18nTextModules.LanguageToggleComponent.lbl.SwitchToGerman
	);

	protected toggleLanguage(): void {
		this.translationService.toggleLanguage();
	}
}
