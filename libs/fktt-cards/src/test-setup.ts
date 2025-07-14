/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv({
	errorOnUnknownElements: true,
	errorOnUnknownProperties: true
});
