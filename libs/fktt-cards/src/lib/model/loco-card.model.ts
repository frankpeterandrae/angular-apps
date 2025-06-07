/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { CardModel } from './card-model';
import { LocoTypeEnum } from './loco-type.enum';
import { LocoUseEnum } from './loco-use.enum';

export interface LocoCardModel extends CardModel {
	dccAddress: string;
	type: LocoTypeEnum;
	use: LocoUseEnum[];
}
