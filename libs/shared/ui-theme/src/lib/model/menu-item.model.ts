/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

export interface MenuItem {
	label: string;
	icon?: string;
	route?: string;
	children?: MenuItem[];
}
