/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { HashMap, Translation, TranslocoConfig, TranslocoTestingModule } from '@jsverse/transloco';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';
import { MockScopedTranslationService } from './lib/mocks/mocked-scoped-translation-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

/**
 * Sets up the Angular testing module with the provided metadata.
 * @param {TestModuleMetadata} param0 - The metadata for the test module, including imports, providers, and declarations.
 * @param {HashMap<Translation>} langs - A hashmap of translations for different languages.
 * @param {Partial<TranslocoConfig>} config - Partial configuration for the Transloco module.
 * @returns {Promise<any>} A promise that resolves when the test module is compiled.
 */
export function sharedSetupTestingModule(
	{ imports = [], providers = [], declarations }: TestModuleMetadata,
	langs: HashMap<Translation> = {
		en: { hello: 'Hello' },
		de: { hello: 'Hallo' }
	},
	config: Partial<TranslocoConfig> = {}
): Promise<any> {
	return TestBed.configureTestingModule({
		imports: [translocoTestingModulFactory(config, langs), ...imports],
		providers: [
			{ provide: ScopedTranslationServiceInterface, useClass: MockScopedTranslationService },
			provideHttpClient(),
			provideHttpClientTesting(),
			...providers
		],
		declarations,
		schemas: [NO_ERRORS_SCHEMA]
	}).compileComponents();
}

/**
 * Creates a Transloco testing module with the provided configuration.
 * @param {Partial<TranslocoConfig>} config - Partial configuration for the Transloco module.
 * @param {HashMap<Translation>} langs - A hashmap of translations for different languages.
 * @returns {ModuleWithProviders<TranslocoTestingModule>} The configured Transloco testing module.
 */
function translocoTestingModulFactory(
	config: Partial<TranslocoConfig>,
	langs: HashMap<Translation> = {
		en: { hello: 'Hello' },
		de: { hello: 'Hallo' }
	}
): ModuleWithProviders<TranslocoTestingModule> {
	return TranslocoTestingModule.forRoot({
		langs: langs,
		translocoConfig: { availableLangs: ['en', 'de'], defaultLang: 'en', ...config }
	});
}
