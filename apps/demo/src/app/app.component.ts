/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ColorsComponent } from '@angular-apps/demo/domain';

import { ButtonComponent, ColorDefinition } from '@angular-apps/shared/ui-theme';
import { Component } from '@angular/core';

@Component({
	standalone: true,
	imports: [ColorsComponent, ButtonComponent],
	selector: 'demo-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	public title = 'demo';
	protected readonly ColorDefinition = ColorDefinition;
}
