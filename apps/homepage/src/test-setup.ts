/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

// Ensure the Angular JIT compiler is loaded for tests that require runtime compilation fallback.
import '@angular/compiler';
import type { TestModuleMetadata } from '@angular/core/testing';
import { sharedSetupTestingModule } from '@application-platform/testing';

import de from '../public/assets/i18n/de.json';
import en from '../public/assets/i18n/en.json';

export function setupTestingModule(metadata: TestModuleMetadata): Promise<void> {
	return sharedSetupTestingModule(metadata, { en, de });
}
