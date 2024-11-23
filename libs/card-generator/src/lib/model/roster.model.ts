/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

// Root RosterModel model
import { CostModel } from './cost.model';
import { ForceModel } from './force.model';

export interface RosterModel {
	costs: CostModel[];
	forces: ForceModel[];
}
