/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

/**
 * TranslationPipe is an Angular pipe that transforms a given string value
 * into its translated equivalent using the `translate` function from `@jsverse/transloco`.
 */
@Pipe({
	name: 'fpaTranslate',
	standalone: true,
})
export class TranslationPipe implements PipeTransform {
	private readonly _translocoService = inject(ScopedTranslationServiceInterface);

	/**
	 * Transforms the input value to a translated string.
	 * @param {string} key - The key to be translated.
	 * @param {string} scope - The scope for the translation.
	 * @param {Record<string, string>} [params] - Optional parameters for the translation.
	 * @returns {Observable<string>} An observable that emits the translated value.
	 */
	public transform(key: string, scope?: string, params: Record<string, string> = {}): Observable<string> {
		return this._translocoService.translate(key, scope, params);
	}
}
