/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { IconDefinition, InputComponent } from '@angular-apps/shared/ui-theme';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';

/**
 * Component for searching colors.
 */
@Component({
	selector: 'cr-color-search',
	templateUrl: './color-search.component.html',
	styleUrls: ['./color-search.component.scss'],
	standalone: true,
	imports: [InputComponent, TranslationPipe, AsyncPipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorSearchComponent {
	/**
	 * Event emitted when a search is performed.
	 */
	@Output() public searchEvent = new EventEmitter<string>();

	/**
	 * Emits the search event with the current search text.
	 * @param {string} $event - The current search text.
	 */
	public onSearchTermChange($event: string): void {
		if ($event != null) {
			this.searchEvent.emit($event);
		}
	}

	protected readonly IconDefinition = IconDefinition;
}
