/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
import { delay, Observable, of } from 'rxjs';
import 'jest-preset-angular/setup-jest';
import en from '../public/assets/i18n/en.json';
import de from '../public/assets/i18n/de.json';
import { TranslocoConfig, TranslocoTestingModule } from '@jsverse/transloco';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { ModuleWithProviders, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ScopedTranslationService } from '@angular-apps/services';

/**
 * Sets up the Angular testing module with the provided metadata.
 * @param {TestModuleMetadata} param0 - The metadata for the test module, including imports, providers, and declarations.
 * @returns {Promise<any>} A promise that resolves when the test module is compiled.
 */
export function setupTestingModule({ imports = [], providers = [], declarations }: TestModuleMetadata): Promise<any> {
	return TestBed.configureTestingModule({
		imports: [translocoTestingModulFactory({}), ...imports],
		providers: [{ provide: ScopedTranslationService, useClass: MockScopedTranslationService }, ...providers],
		declarations,
		schemas: [NO_ERRORS_SCHEMA],
	}).compileComponents();
}

/**
 * Mock service for ScopedTranslationService.
 */
class MockScopedTranslationService {
	/**
	 * Mocked translate function.
	 * @param {string} key - The key to be translated.
	 * @param {string} [scope] - The optional scope for the translation.
	 * @param {Record<string, string>} [params] - The optional parameters for the translation.
	 * @returns {Observable<string>} An observable that emits the translated string.
	 */
	public translate = (key: string, scope?: string, params: Record<string, string> = {}): Observable<string> =>
		of(key).pipe(delay(100)); // Add a short delay

	public currentLang = signal('en'); // Mock `currentLang` as a signal
	public toggleLanguage = jest.fn(); // Mock toggleLanguage method
}
/**
 * Creates a Transloco testing module with the provided configuration.
 * @param {Partial<TranslocoConfig>} config - Partial configuration for the Transloco module.
 * @returns {TranslocoTestingModule} The configured Transloco testing module.
 */
function translocoTestingModulFactory(config: Partial<TranslocoConfig>): ModuleWithProviders<TranslocoTestingModule> {
	return TranslocoTestingModule.forRoot({
		langs: { en, de },
		translocoConfig: { availableLangs: ['en', 'de'], defaultLang: 'en', ...config },
	});
}
