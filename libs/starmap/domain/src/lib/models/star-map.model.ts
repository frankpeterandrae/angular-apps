/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { JumpLink } from './jump-link.model';
import type { Nebula } from './nebula.model';
import type { StarSystem } from './star-system.model';

export interface StarMap {
	id: string;
	name: string;
	systems: StarSystem[];
	jumpLinks: JumpLink[];
	nebulae: Nebula[];
}
