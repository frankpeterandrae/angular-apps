/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { MenuItem } from '../../model/menu-item.model';
import { TopnavbarComponent } from '../navigation/topnavbar/topnavbar.component';

@Component({
	selector: 'theme-header',
	standalone: true,
	imports: [TopnavbarComponent],
	templateUrl: './header.component.html',
	styleUrl: './header.component.css',
})
export class HeaderComponent {
	public menuItems = input.required<MenuItem[]>();
}
