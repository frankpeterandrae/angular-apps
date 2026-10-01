/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { ButtonConfigModel } from './button-config.model';

/** Configures the buttons rendered by a button bar. */
export interface ButtonBarConfig {
	buttons: ButtonConfigModel[];
}
