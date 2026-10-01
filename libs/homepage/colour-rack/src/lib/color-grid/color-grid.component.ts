/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { NumberInput } from '@angular/cdk/coercion';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgStyle } from '@angular/common';
import { type AfterViewInit, type OnChanges, type OnInit, Component, HostListener, inject, input, signal, viewChild } from '@angular/core';
import { type DialogConfigModel, DialogService, DialogType } from '@application-platform/shared/ui-theme';
import { LOGGER_SOURCE, Scopes, TranslationDirective } from '@application-platform/shared-ui';
import { provideTranslocoScope } from '@jsverse/transloco';

import { ColorDetailsComponent } from '../color-details/color-details.component';
import { i18nTextModules } from '../i18n/i18n';
import type { Color } from '../models/color.model';
import { ColorService } from '../services/color.service';

/**
 * Component representing a grid of colors.
 */
@Component({
	selector: 'cr-color-grid',
	templateUrl: './color-grid.component.html',
	styleUrls: ['./color-grid.component.scss'],
	imports: [NgStyle, CdkVirtualScrollViewport, CdkVirtualForOf, CdkFixedSizeVirtualScroll, TranslationDirective],
	providers: [{ provide: LOGGER_SOURCE, useValue: 'ColorGridComponent' }, provideTranslocoScope(Scopes.COLOUR_RACK)]
})
export class ColorGridComponent implements AfterViewInit, OnInit, OnChanges {
	private readonly colorService = inject(ColorService);
	private readonly dialogService = inject(DialogService);
	protected readonly i18nTextModules = i18nTextModules;

	protected readonly viewPort = viewChild.required(CdkVirtualScrollViewport);
	/**
	 * The search query used to filter and highlight colors.
	 */
	public searchQuery = input<string | undefined>(undefined);

	/**
	 * The list of colors to be displayed in the grid.
	 */
	protected readonly colors = signal<Color[][]>([]);
	protected itemSize: NumberInput = 68;
	private readonly allColors = signal<Color[]>([]);
	private chunkSize = 12;

	@HostListener('window:resize')
	protected adjustOnWindowResize(): void {
		this.updateItemSize();
		this.updateChunkSize();
		this.updateColorChunks();
	}

	ngOnInit(): void {
		this.updateChunkSize();
		this.fetchColors();
	}

	ngOnChanges(): void {
		this.highlightMatchingColors(this.searchQuery() || '');
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.updateItemSize();
		});
	}

	private fetchColors(): void {
		this.colorService.getColors().subscribe((colors) => {
			this.calculateStorageLocation(colors);
			this.allColors.set(colors);
			this.updateColorChunks();
			this.highlightMatchingColors(this.searchQuery() ?? '');
		});
	}

	private updateColorChunks(): void {
		const chunks: Color[][] = [];

		for (let index = 0; index < this.allColors().length; index += this.chunkSize) {
			chunks.push(this.allColors().slice(index, index + this.chunkSize));
		}

		this.colors.set(chunks);
	}

	/**
	 * Highlights the colors that match the search query.
	 * @param {string} query - The search query to match against color names.
	 */
	public highlightMatchingColors(query: string): void {
		this.colors().forEach((colorRow) => {
			colorRow.forEach((color) => {
				const allNames = [color.name, ...color.alternativeNames];
				color.highlighted = query ? allNames.some((name) => name.toLowerCase().includes(query.toLowerCase())) : false;
			});
		});
	}

	private calculateStorageLocation(colors: Color[]): Color[] {
		colors.forEach((color, idx) => {
			color.row = Math.floor(idx / 12) + 1;
			color.column = (idx % 12) + 1;
		});
		return colors;
	}

	protected openDetails(color: Color): void {
		const dialogConfig: DialogConfigModel<Color> = { componentData: color, settings: { title: color.name, type: DialogType.INFO } };

		this.dialogService.open(ColorDetailsComponent, dialogConfig);
	}

	private updateItemSize(): void {
		const firstCard: HTMLElement | null = this.viewPort().elementRef.nativeElement.querySelector('.color-tile');
		if (firstCard) {
			const marginTop = Number.parseInt((globalThis as unknown as Window).getComputedStyle(firstCard).marginTop, 10);
			const marginBottom = Number.parseInt((globalThis as unknown as Window).getComputedStyle(firstCard).marginBottom, 10);
			this.itemSize = firstCard.offsetHeight + marginTop + marginBottom;
		}
		this.updateChunkSize();
	}

	private updateChunkSize(): void {
		const win = globalThis as unknown as Window;
		const screenWidth = win.innerWidth / Number.parseFloat(win.getComputedStyle(document.documentElement).fontSize);
		if (screenWidth <= 40) {
			this.chunkSize = 2; // xs
		} else if (screenWidth <= 56.25) {
			this.chunkSize = 3; // sm
		} else if (screenWidth <= 78.125) {
			this.chunkSize = 6; // md
		} else if (screenWidth <= 100) {
			this.chunkSize = 6; // lg
		} else {
			this.chunkSize = 12; // xl
		}
	}

	protected backgroundColor(color: Color): string {
		if (color.secondaryColor) {
			switch (color.type) {
				case 'ME':
				case 'S-ME':
				case 'M-ME':
				case 'H-ME':
					return `linear-gradient(-45deg, ${color.secondaryColor}, ${color.mainColor}, ${color.secondaryColor})`;
				case 'I':
				case 'G':
					return `linear-gradient(0deg,${color.secondaryColor},${color.mainColor})`;
				case 'W':
					return `radial-gradient(circle,${color.mainColor}, ${color.secondaryColor})`;
				case 'M':
				case 'S':
				case 'H':
				case 'E':
				case 'B':
				case 'DA':
					return color.mainColor;
			}
		}
		return color.mainColor;
	}
}
