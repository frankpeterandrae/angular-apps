/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

export interface Color {
	name: string;
	alternativeNames: string[];
	type: string;
	mainColor: string;
	secondaryColor?: string;
	highlighted?: boolean;
	wave?: number;
	sku?: number;
	barcode?: number;
	row?: number;
	column?: number;
	layer?: number;
	shade?: number;
	highlight?: number;
}
