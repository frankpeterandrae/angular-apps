/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

export interface CardModel {
	owner: string;
	image: string;
	cardNumber: string;
	colorCode: string;

	manufacturer: string;
	operatingNumber: string;
	epoch: string; // Enum
	railroadAdministration: string;
	description: string;
	clutch: string; // Enum
	lengthOverBuffer: string;
	mass: string;
}
