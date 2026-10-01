/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Planet } from './planet.model';
import type { Position3d } from './position.model';
import type { Star } from './star.model';

export interface StarSystem {
	id: string;
	name: string;
	faction?: string;
	position: Position3d;
	stars: Star[];
	planets: Planet[];
}
