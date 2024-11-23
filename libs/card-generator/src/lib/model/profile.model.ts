/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

// ProfileModel model
import { CharacteristicModel } from './characteristic.model';

export interface ProfileModel {
	id: string;
	name: string;
	hidden: boolean;
	typeId: string;
	typeName: string;
	from: string;
	characteristics: CharacteristicModel[];
}
