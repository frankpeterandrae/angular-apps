/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';

/**
 * Component representing the homepage feature.
 */
@Component({
	selector: 'homepage-feature',
	standalone: true,
	imports: [HeroComponent],
	templateUrl: './home.component.html',
})
export class HomeComponent {}
