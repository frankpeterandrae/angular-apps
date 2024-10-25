/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ButtonComponent, ColorDefinition } from '@angular-apps/shared/ui-theme';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Component for searching colors.
 */
@Component({
	selector: 'cr-color-search',
	templateUrl: './color-search.component.html',
	styleUrls: ['./color-search.component.scss'],
	standalone: true,
	imports: [FormsModule, ButtonComponent],
})
export class ColorSearchComponent {
	/**
	 * The text to search for.
	 */
	public searchText = '';

	/**
	 * Event emitted when a search is performed.
	 */
	@Output() public searchEvent = new EventEmitter<string>();

	/**
	 * Emits the search event with the current search text.
	 */
	public onSearch(): void {
		this.searchEvent.emit(this.searchText);
	}

	/**
	 * Reference to the ColorDefinition class.
	 */
	protected readonly ColorDefinition = ColorDefinition;
}
