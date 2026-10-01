/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject } from '@angular/core';
import { type DialogConfigModel, DIALOG_DATA, DialogComponent } from '@application-platform/shared/ui-theme';
import { BaseComponent, LOGGER_SOURCE, Scopes, TranslationDirective } from '@application-platform/shared-ui';
import { provideTranslocoScope } from '@jsverse/transloco';

import { i18nTextModules } from '../i18n/i18n';
import { ColorType } from '../models/color-type.enum';
import type { Color } from '../models/color.model';

/** Displays the details of a selected color. */
@Component({
	selector: 'cr-color-details',
	imports: [DialogComponent, TranslationDirective],
	templateUrl: './color-details.component.html',
	providers: [{ provide: LOGGER_SOURCE, useValue: 'ColorDetailsComponent' }, provideTranslocoScope(Scopes.COLOUR_RACK)]
})
export class ColorDetailsComponent extends BaseComponent {
	public readonly data = inject<DialogConfigModel<Color>>(DIALOG_DATA);
	protected readonly i18nTextModules = i18nTextModules;

	protected colorType(): string {
		const types = this.data.componentData?.type.split('-');

		if (!types?.every((type) => type in ColorType)) {
			return 'Unknown';
		}

		return types.map((type) => ColorType[type as keyof typeof ColorType]).join('-');
	}
}
