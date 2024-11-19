/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TranslocoService } from '@jsverse/transloco';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

/**
 * ScopedTranslationService is an Angular service that provides scoped translation functionality.
 * It uses the TranslocoService to fetch translations for specific keys within an optional scope.
 */
@Injectable({ providedIn: 'root' })
export class ScopedTranslationService implements ScopedTranslationServiceInterface {
	private readonly translocoService = inject(TranslocoService);

	readonly #currentLang = signal<string>('');
	public readonly currentLang = computed(this.#currentLang);

	/**
	 * Creates an instance of ScopedTranslationService.
	 * Sets the active language to German ('de').
	 */
	constructor() {
		this.translocoService.setActiveLang('de');
		this.getActiveLang();
	}

	/**
	 * Translates a given key within an optional scope and with optional parameters.
	 * @param {string} key - The key to be translated.
	 * @param {string} [scope] - The optional scope for the translation.
	 * @param {Record<string, string>} [params] - The optional parameters for the translation.
	 * @returns {Observable<string>} An observable that emits the translated string.
	 */
	public translate(key: string, scope?: string, params: Record<string, string> = {}): Observable<string> {
		return this.translocoService.selectTranslate(key, params, scope);
	}

	/**
	 * Toggles the active language to the next available language.
	 */
	public toggleLanguage(): void {
		const availableLangs = this.translocoService.getAvailableLangs();
		const currentLang = this.translocoService.getActiveLang();
		const nextLang = availableLangs.find((lang) => lang !== currentLang) as string;
		this.translocoService.setActiveLang(nextLang);
		this.getActiveLang();
	}

	/**
	 * Updates the current language signal with the active language.
	 */
	public getActiveLang(): void {
		this.#currentLang.set(this.translocoService.getActiveLang());
	}
}
