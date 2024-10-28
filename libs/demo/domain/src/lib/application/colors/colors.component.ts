/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Component representing a color palette with various shades.
 */
@Component({
	selector: 'demo-colors',
	standalone: true,
	imports: [NgClass],
	templateUrl: './colors.component.html',
	styleUrl: './colors.component.scss',
})
export class ColorsComponent {
	/**
	 * List of color names.
	 */
	public colors = ['linen', 'sandy-brown', 'crimson', 'slate-gray', 'ebony'];

	/**
	 * List of shade levels.
	 */
	public shades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}
