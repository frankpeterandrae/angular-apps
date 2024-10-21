/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { ButtonComponent, ColorDefinition } from '@angular-apps/shared/ui-theme';
import { Router } from '@angular/router';

@Component({
	selector: 'homepage-feature-error404',
	standalone: true,
	imports: [ButtonComponent],
	templateUrl: './error404.component.html',
	styleUrl: './error404.component.scss',
})
export class Error404Component {
	protected readonly ColorDefinition = ColorDefinition;

	constructor(private router: Router) {}

	public routeToHome(): void {
		this.router.navigate(['/']).catch((error) => console.error(error));
	}
}
