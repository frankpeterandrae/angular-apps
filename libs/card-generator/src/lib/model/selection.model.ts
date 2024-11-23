/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

// SelectionModel model
import { ProfileModel } from './profile.model';
import { RuleModel } from './rule.model';

export interface SelectionModel {
	id: string;
	name: string;
	entryId: string;
	number: number;
	type: string;
	from: string;
	profiles?: ProfileModel[];
	rules?: RuleModel[];
}
