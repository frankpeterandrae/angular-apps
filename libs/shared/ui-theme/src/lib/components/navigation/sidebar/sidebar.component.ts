/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '@angular-apps/config';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';
import { MenuItem } from '../../../model/menu-item.model';

@Component({
	selector: 'theme-sidebar',
	standalone: true,
	imports: [CommonModule, RouterLink, FastSvgComponent],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
	public menuItems = input.required<MenuItem[]>();
	protected readonly environment = environment;
}
