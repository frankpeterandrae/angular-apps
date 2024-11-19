/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, signal } from '@angular/core';
import { ColorGridComponent } from '../color-grid/color-grid.component';
import { ColorSearchComponent } from '../color-search/color-search.component';
import { TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

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
	 * Constructor for ColorSearchContainerComponent.
	 * @param {Meta} meta - The meta service used to set meta tags.
	 * @param {Title} title - The title service used to set the title.
	 * @param {ScopedTranslationServiceInterface} translocoService - The translation service used for fetching translations.
	 */
	constructor(
		private readonly meta: Meta,
		private readonly title: Title,
		private readonly translocoService: ScopedTranslationServiceInterface,
	) {
		this.translocoService
			.selectTranslate('ColorSearchContainerComponent.meta.Title', 'color-rack')
			.subscribe((translation) => {
				this.title.setTitle(translation);
			});

		this.translocoService
			.selectTranslate('ColorSearchContainerComponent.meta.Description', 'color-rack')
			.subscribe((translation) => {
				this.meta.addTag({ name: 'description', content: translation });
			});
	}

	/**
	 * Signal to hold the search query.
	 */
	public searchQuery = signal('');

	/**
	 * Updates the search query signal with the provided query.
	 * @param {string} query - The new search query string.
	 */
	public updateSearchQuery(query: string): void {
		this.searchQuery.set(query);
	}
}
