/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { IconDefinition, InputComponent } from '@application-platform/shared/ui-theme';
import { translateSignal } from '@jsverse/transloco';

import { i18nTextModules } from '../i18n/i18n';

/** Provides the color search input. */
@Component({
	selector: 'cr-color-search',
	templateUrl: './color-search.component.html',
	styleUrls: ['./color-search.component.scss'],
	imports: [InputComponent],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorSearchComponent {
	/**
	 * Event emitted when a search is performed.
	 */
	public readonly searchEvent = output<string>();

	protected readonly searchColor = translateSignal(i18nTextModules.ColorSearch.lbl.SearchColor);

	protected readonly IconDefinition = IconDefinition;

	/**
	 * Emits the current search term.
	 */
	protected onSearchTermChange(searchTerm: string): void {
		this.searchEvent.emit(searchTerm);
	}
}
