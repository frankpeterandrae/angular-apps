/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

export interface FpaLibraryGeneratorSchema {
	name: string;
	directory: string;
	feature?: boolean;
	onlyConfig?: boolean;
	tags?: string;
}
