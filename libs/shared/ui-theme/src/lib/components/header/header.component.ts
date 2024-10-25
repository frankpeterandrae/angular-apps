/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { MenuItem } from '../../model/menu-item.model';
import { TopnavbarComponent } from '../navigation/topnavbar/topnavbar.component';

/**
 * HeaderComponent is a standalone component that represents the header section of the application.
 * It includes the TopnavbarComponent and uses an external HTML template and CSS stylesheet.
 */
@Component({
	selector: 'theme-header',
	standalone: true,
	imports: [TopnavbarComponent],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css',
})
export class HeaderComponent {
	/**
	 * An array of MenuItem objects that represent the items to be displayed in the menu.
	 */
	public menuItems = input.required<MenuItem[]>();
}
