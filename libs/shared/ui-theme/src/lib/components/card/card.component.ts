/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'theme-card',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './card.component.html',
	styleUrl: './card.component.scss',
})
export class CardComponent {
	public inverted = input<boolean>();
}
