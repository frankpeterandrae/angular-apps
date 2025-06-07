/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { CardModel } from './card-model';

export interface LocoCardModel extends CardModel {
	dccAddress: string;
}
