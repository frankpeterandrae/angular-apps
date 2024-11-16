/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, signal } from '@angular/core';
import { ColorGridComponent } from '../color-grid/color-grid.component';
import { ColorSearchComponent } from '../color-search/color-search.component';
import { TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';

/**
 * Component for the color search container.
 */
@Component({
	selector: 'cr-color-search-container',
	templateUrl: './color-search-container.component.html',
	standalone: true,
	imports: [ColorSearchComponent, ColorGridComponent, TranslationPipe, AsyncPipe],
})
export class ColorSearchContainerComponent {
	/**
	 * Signal to hold the search query.
	 */
	public searchQuery = signal('');

	/**
	 * Updates the search query signal with the provided query.
	 * @param query - The new search query string.
	 */
	public updateSearchQuery(query: string): void {
		this.searchQuery.set(query);
	}
}
