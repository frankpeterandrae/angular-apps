/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../../../model/menu-item.model';
import { Router, RouterLink } from '@angular/router';
import { ColorDefinition } from '../../../enums';

/**
 * Component representing the top navigation bar.
 */
@Component({
	selector: 'theme-topnavbar',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './top-navbar.component.html',
	styleUrl: './top-navbar.component.scss',
})
export class TopNavbarComponent {
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
	 * @param {Router} router - The Angular Router service.
	 */
	constructor(public readonly router: Router) {}

	/**
	 * Gets the current route URL.
	 * @returns {string} - The current route URL as a string.
	 */
	public getCurrentRoute(): string {
		return this.router.url;
	}

	/**
	 * Toggles the visibility of a dropdown menu.
	 * @param {string} route - The route associated with the dropdown menu.
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
