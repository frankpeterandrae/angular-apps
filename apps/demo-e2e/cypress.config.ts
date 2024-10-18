/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: nxE2EPreset(__dirname),
});
