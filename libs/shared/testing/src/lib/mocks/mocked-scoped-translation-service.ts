/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { delay, Observable, of } from 'rxjs';
import { signal } from '@angular/core';
import * as jestMock from 'jest-mock';

/**
 * Mock service for ScopedTranslationService.
 */
export class MockScopedTranslationService {
	/**
	 * Mocked translate function.
	 * @param {string} key - The key to be translated.
	 * @param {string} [scope] - The optional scope for the translation.
	 * @param {Record<string, string>} [params] - The optional parameters for the translation.
	 * @returns {Observable<string>} An observable that emits the translated string.
	 */
	public translate = (key: string, scope?: string, params: Record<string, string> = {}): Observable<string> => {
		return of(key).pipe(delay(100));
	}; // Add a short delay

	public currentLang = signal('en'); // Mock `currentLang` as a signal
	public toggleLanguage = jestMock.fn(); // Mock toggleLanguage method
}
