/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { NgStyle } from '@angular/common';
import { Component, input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Color } from '../models/color.model';
import { ColorService } from '../services/color.service';

@Component({
	selector: 'cr-color-grid',
	templateUrl: './color-grid.component.html',
	styleUrls: ['./color-grid.component.scss'],
	standalone: true,
	imports: [NgStyle],
})
export class ColorGridComponent implements OnInit, OnChanges {
	public searchQuery = input<string | undefined>(undefined);

	public colors = signal<Color[]>([]);

	constructor(private colorService: ColorService) {}

	ngOnInit(): void {
		this.fetchColors();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['searchQuery']) {
			this.highlightMatchingColors(this.searchQuery() || '');
		}
	}

	private fetchColors(): void {
		this.colorService.getColors().subscribe((colors) => {
			this.colors.set(colors);
			this.highlightMatchingColors(this.searchQuery() || '');
		});
	}

	private highlightMatchingColors(query: string): void {
		this.colors().forEach((color) => {
			const allNames = [color.name, ...color.alternativeNames];
			color.highlighted = query ? allNames.some((name) => name.toLowerCase().includes(query.toLowerCase())) : false;
		});
	}

	public calculatedStorageLocation(idx: number): string {
		// calculate the storage location based on the index of the color, based on the assumption that the colors are stored in a 2D grid with 12 columns
		const row = Math.floor(idx / 12);
		const col = idx % 12;
		return `row ${row + 1} col ${col + 1}`;
	}
}
