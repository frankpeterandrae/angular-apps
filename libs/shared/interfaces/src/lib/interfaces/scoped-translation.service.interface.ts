/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Observable } from 'rxjs';
import { Signal } from '@angular/core';

/**
 *
 */
export abstract class ScopedTranslationServiceInterface {
	public abstract currentLang: Signal<string>;
	public abstract translate(key: string, scope?: string, params?: Record<string, string>): string;
	public abstract selectTranslate(key: string, scope?: string, params?: Record<string, string>): Observable<string>;
	public abstract toggleLanguage(): void;
	public abstract getActiveLang(): void;
}
