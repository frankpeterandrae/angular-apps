/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { StarMap } from '@application-platform/starmap-domain';

export interface StarMapFile {
	version: 1;
	map: StarMap;
}
