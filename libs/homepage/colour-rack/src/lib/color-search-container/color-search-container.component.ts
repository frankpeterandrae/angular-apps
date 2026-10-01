/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LOGGER_SOURCE, Scopes, TranslationDirective } from '@application-platform/shared-ui';
import { provideTranslocoScope, translateSignal } from '@jsverse/transloco';

import { ColorGridComponent } from '../color-grid/color-grid.component';
import { ColorSearchComponent } from '../color-search/color-search.component';
import { i18nTextModules } from '../i18n/i18n';

/** Coordinates the color search and color grid. */
@Component({
	selector: 'cr-color-search-container',
	templateUrl: './color-search-container.component.html',
	imports: [ColorSearchComponent, ColorGridComponent, TranslationDirective],
	providers: [{ provide: LOGGER_SOURCE, useValue: 'ColorSearchContainerComponent' }, provideTranslocoScope(Scopes.COLOUR_RACK)]
})
export class ColorSearchContainerComponent implements OnInit {
	private readonly meta = inject(Meta);
	private readonly title = inject(Title);

	private readonly metaTitle = translateSignal(i18nTextModules.ColorSearchContainer.meta.Title);

	private readonly metaDescription = translateSignal(i18nTextModules.ColorSearchContainer.meta.Description);

	protected readonly i18nTextModules = i18nTextModules;
	protected readonly searchQuery = signal('');

	ngOnInit(): void {
		this.title.setTitle(this.metaTitle());

		this.meta.addTag({
			name: 'description',
			content: this.metaDescription()
		});
	}

	protected updateSearchQuery(query: string): void {
		this.searchQuery.set(query);
	}
}
