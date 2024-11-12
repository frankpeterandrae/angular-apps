/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';

/**
 * Component decorator for defining the HeroComponent.
 * @author Frank-Peter Andrä
 */
@Component({
	selector: 'homepage-feature-hero',
	standalone: true,
	templateUrl: './hero.component.html',
	styleUrl: './hero.component.scss',
})
export class HeroComponent {}
