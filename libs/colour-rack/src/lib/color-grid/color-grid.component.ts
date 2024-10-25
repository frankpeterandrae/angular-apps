/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { NgStyle } from '@angular/common';
import { Component, input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Color } from '../models/color.model';
import { ColorService } from '../services/color.service';

/**
 * Component representing a grid of colors.
 */
@Component({
	selector: 'cr-color-grid',
	templateUrl: './color-grid.component.html',
	styleUrls: ['./color-grid.component.scss'],
	standalone: true,
	imports: [NgStyle],
})
export class ColorGridComponent implements OnInit, OnChanges {
	/**
	 * The search query used to filter and highlight colors.
	 */
	public searchQuery = input<string | undefined>(undefined);

	/**
	 * The list of colors to be displayed in the grid.
	 */
	public colors = signal<Color[]>([]);

	/**
	 * Constructor to inject the ColorService.
	 * @param colorService - The service used to fetch colors.
	 */
	constructor(private colorService: ColorService) {}

	/**
	 * Lifecycle hook that is called after data-bound properties are initialized.
	 */
	ngOnInit(): void {
		this.fetchColors();
	}

	/**
	 * Lifecycle hook that is called when any data-bound property of a directive changes.
	 * @param changes - The changes in the data-bound properties.
	 */
	ngOnChanges(changes: SimpleChanges): void {
		if (changes['searchQuery']) {
			this.highlightMatchingColors(this.searchQuery() || '');
		}
	}

	/**
	 * Fetches the colors from the ColorService and updates the colors list.
	 */
	private fetchColors(): void {
		this.colorService.getColors().subscribe((colors) => {
			this.colors.set(colors);
			this.highlightMatchingColors(this.searchQuery() || '');
		});
	}

	/**
	 * Highlights the colors that match the search query.
	 * @param query - The search query to match against color names.
	 */
	private highlightMatchingColors(query: string): void {
		this.colors().forEach((color) => {
			const allNames = [color.name, ...color.alternativeNames];
			color.highlighted = query ? allNames.some((name) => name.toLowerCase().includes(query.toLowerCase())) : false;
		});
	}

	/**
	 * Calculates the storage location of a color based on its index.
	 * @param idx - The index of the color in the list.
	 * @returns The storage location in the format `row X col Y`.
	 */
	public calculatedStorageLocation(idx: number): string {
		const row = Math.floor(idx / 12);
		const col = idx % 12;
		return `row ${row + 1} col ${col + 1}`;
	}
}
