/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, signal } from '@angular/core';
import { ColorGridComponent } from '../color-grid/color-grid.component';
import { ColorSearchComponent } from '../color-search/color-search.component';

@Component({
	selector: 'cr-color-search-container',
	templateUrl: './color-search-container.component.html',
	styleUrls: ['./color-search-container.component.scss'],
	standalone: true,
	imports: [ColorSearchComponent, ColorGridComponent],
})
export class ColorSearchContainerComponent {
	public searchQuery = signal('');

	public updateSearchQuery(query: string): void {
		this.searchQuery.set(query);
	}
}
