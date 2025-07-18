/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogComponent, DialogConfigModel } from '@angular-apps/shared/ui-theme';
import { ColorType } from '../models/color-type.enum';
import { Color } from '../models/color.model';
import { TranslationPipe } from '@angular-apps/services';

/**
 * Component representing the details of a color.
 */
@Component({
	selector: 'cr-color-details',
	imports: [CommonModule, DialogComponent, TranslationPipe],
	templateUrl: './color-details.component.html'
})
export class ColorDetailsComponent {
	public readonly data = inject<DialogConfigModel<Color>>(DIALOG_DATA);

	/**
	 * Returns the color type as a string.
	 * @returns {string} - The color type as a string.
	 */
	public colorType(): string {
		const types = this.data.componentData?.type?.split('-');

		if (types?.every((type) => type in ColorType)) {
			return types.map((type) => ColorType[type as keyof typeof ColorType]).join('-');
		}
		return 'Unknown';
	}
}
