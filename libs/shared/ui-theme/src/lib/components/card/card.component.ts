/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * CardComponent is a standalone Angular component that represents a card UI element.
 * It uses the CommonModule and has an external HTML template and SCSS stylesheet.
 */
@Component({
    selector: 'theme-card',
    imports: [CommonModule],
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss'
})
export class CardComponent {
	/**
	 * A boolean input property that determines if the card is inverted.
	 */
	public inverted = input<boolean>();
}
