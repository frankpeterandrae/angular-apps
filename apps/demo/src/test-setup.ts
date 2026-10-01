/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

// Ensure the Angular JIT compiler is loaded for tests that require runtime compilation fallback.
import '@angular/compiler';
import type { TestModuleMetadata } from '@angular/core/testing';
import { setupTestingModule as sharedSetup } from '@application-platform/testing';

export function setupTestingModule({ imports = [], providers = [], declarations }: TestModuleMetadata): Promise<void> {
	return sharedSetup({ imports, providers, declarations });
}
