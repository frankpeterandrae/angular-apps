/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { CardComponent } from '@angular-apps/shared/ui-theme';

/**
 * Component representing the homepage feature.
 * @author Frank-Peter Andrä
 */
@Component({
	selector: 'homepage-feature',
	standalone: true,
	imports: [CardComponent],
	templateUrl: './home.component.html',
})
export class HomeComponent {}
