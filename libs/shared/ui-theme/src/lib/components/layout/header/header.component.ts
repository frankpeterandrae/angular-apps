/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';

import type { MenuItem } from '../../../model';
import { TopNavbarComponent } from '../../navigation/top-navbar/top-navbar.component';

/**
 * Displays the application header with its primary navigation.
 */
@Component({
	selector: 'theme-header',
	imports: [TopNavbarComponent],
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
	public readonly menuItems = input<MenuItem[]>([]);
}
