/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ColorsComponent } from '@angular-apps/demo/domain';

import { ButtonComponent, ColorDefinition } from '@angular-apps/shared/ui-theme';
import { Component } from '@angular/core';

/**
 * The root component of the demo application.
 */
@Component({
	standalone: true,
	imports: [ColorsComponent, ButtonComponent],
	selector: 'demo-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	/** The title of the application. */
	public title = 'demo';

	/** The color definitions used in the application. */
	protected readonly ColorDefinition = ColorDefinition;
}
