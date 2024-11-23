/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

// ForceModel model
import { SelectionModel } from './selection.model';
import { ProfileModel } from './profile.model';
import { RuleModel } from './rule.model';
import { CategoryModel } from './category.model';

export interface ForceModel {
	selections: SelectionModel[];
	profiles?: ProfileModel[];
	rules?: RuleModel[];
	categories?: CategoryModel[];
	id: string;
	name: string;
	entryId: string;
	number: number;
	type: string;
	from: string;
}
