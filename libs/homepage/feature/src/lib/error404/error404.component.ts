/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { ButtonComponent, ColorDefinition } from '@angular-apps/shared/ui-theme';
import { Router } from '@angular/router';

/**
 * Component for displaying a 404 error page.
 */
@Component({
	selector: 'homepage-feature-error404',
	standalone: true,
	imports: [ButtonComponent],
	templateUrl: './error404.component.html',
	styleUrl: './error404.component.scss',
})
export class Error404Component {
	protected readonly ColorDefinition = ColorDefinition;

	/**
	 * Constructor for Error404Component.
	 * @param router - The Angular Router service.
	 */
	constructor(private router: Router) {}

	/**
	 * Navigates to the home page.
	 */
	public routeToHome(): void {
		this.router.navigate(['/']).catch((error) => console.error(error));
	}
}
