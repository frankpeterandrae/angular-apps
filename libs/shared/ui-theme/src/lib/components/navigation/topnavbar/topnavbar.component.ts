/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../../model/menu-item.model';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';
import { Router, RouterLink } from '@angular/router';
import { ColorDefinition } from '../../../enums';

@Component({
	selector: 'theme-topnavbar',
	standalone: true,
	imports: [CommonModule, FastSvgComponent, RouterLink],
	templateUrl: './topnavbar.component.html',
	styleUrl: './topnavbar.component.scss',
})
export class TopnavbarComponent {
	public menuItems = input.required<MenuItem[]>();
	protected readonly ColorDefinition = ColorDefinition;
	public showDropdown: { [key: string]: boolean } = {};

	constructor(private router: Router) {}

	public getCurrentRoute(): string {
		return this.router.url;
	}

	public toggleNavigation(route: string): void {
		this.showDropdown[route] = !this.showDropdown[route];
	}

	public resetDropdowns(): void {
		this.showDropdown = {};
	}
}
