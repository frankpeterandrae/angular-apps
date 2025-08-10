/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Signal } from '@angular/core';

export interface MenuItem {
	id: string;
	label: Signal<string>;
	icon?: string;
	route?: string;
	children?: MenuItem[];
}
