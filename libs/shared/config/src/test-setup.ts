/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
	testEnvironmentOptions: {
		errorOnUnknownElements: true,
		errorOnUnknownProperties: true,
	},
};
import 'jest-preset-angular/setup-jest';
import { TranslocoConfig, TranslocoTestingModule } from '@jsverse/transloco';
import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { ModuleWithProviders, NO_ERRORS_SCHEMA } from '@angular/core';

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
		langs: { en: { hello: 'Hello' }, de: { hello: 'Hallo' } },
		translocoConfig: { availableLangs: ['en', 'de'], defaultLang: 'en', ...config },
	});
}
