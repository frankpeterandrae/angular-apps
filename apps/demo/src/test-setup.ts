/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TranslocoConfig, TranslocoTestingModule } from '@jsverse/transloco';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';

setupZoneTestEnv();

/**
 * Sets up the Angular testing module with the provided metadata.
 * @param {TestModuleMetadata} param0 - The metadata for the test module, including imports, providers, and declarations.
 * @returns {Promise<any>} A promise that resolves when the test module is compiled.
 */
export function setupTestingModule({ imports = [], providers, declarations }: TestModuleMetadata): Promise<any> {
	return TestBed.configureTestingModule({
		imports: [translocoTestingModulFactory({}), ...imports],
		providers,
		declarations,
		schemas: [NO_ERRORS_SCHEMA],
	}).compileComponents();
}

/**
 * Creates a Transloco testing module with the provided configuration.
 * @param {Partial<TranslocoConfig>} config - Partial configuration for the Transloco module.
 * @returns {TranslocoTestingModule} The configured Transloco testing module.
 */
function translocoTestingModulFactory(config: Partial<TranslocoConfig>): ModuleWithProviders<TranslocoTestingModule> {
	return TranslocoTestingModule.forRoot({
		langs: { en: {}, de: {} },
		translocoConfig: { availableLangs: ['en', 'de'], defaultLang: 'en', ...config },
	});
}
