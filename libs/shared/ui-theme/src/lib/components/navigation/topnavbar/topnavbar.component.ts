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

/**
 * Component representing the top navigation bar.
 */
@Component({
	selector: 'theme-topnavbar',
	standalone: true,
	imports: [CommonModule, FastSvgComponent, RouterLink],
	templateUrl: './topnavbar.component.html',
	styleUrl: './topnavbar.component.scss',
})
export class TopnavbarComponent {
	/**
	 * Array of menu items to be displayed in the navigation bar.
	 */
	public menuItems = input.required<MenuItem[]>();

	/**
	 * Enum for color definitions.
	 */
	protected readonly ColorDefinition = ColorDefinition;

	/**
	 * Object to track the state of dropdown menus.
	 */
	public showDropdown: { [key: string]: boolean } = {};

	/**
	 * Constructor to inject the Router service.
	 * @param router - The Angular Router service.
	 */
	constructor(private router: Router) {}

	/**
	 * Gets the current route URL.
	 * @returns The current route URL as a string.
	 */
	public getCurrentRoute(): string {
		return this.router.url;
	}

	/**
	 * Toggles the visibility of a dropdown menu.
	 * @param route - The route associated with the dropdown menu.
	 */
	public toggleNavigation(route: string): void {
		this.showDropdown[route] = !this.showDropdown[route];
	}

	/**
	 * Resets all dropdown menus to be hidden.
	 */
	public resetDropdowns(): void {
		this.showDropdown = {};
	}
}
