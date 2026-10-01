/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { ImageLoaderComponent } from '@application-platform/shared/ui-theme';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

/** Displays image loader usage examples. */
@Component({
	selector: 'demo-image-loader',
	imports: [ImageLoaderComponent, DemoThemeContainerComponent],
	templateUrl: './image-loader.component.html'
})
export class ImageLoaderDemoComponent {
	protected readonly description: Description = {
		title: i18nTextModules.ImageLoader.lbl.Title,
		description: i18nTextModules.ImageLoader.lbl.Description,
		usage:
			'<theme-image-loader\n' +
			'\t[src]="\'assets/images/example.jpg\'"\n' +
			'\t[alt]="\'Example image\'"\n' +
			'></theme-image-loader>',
		language: 'html',
		definition: {
			span: 12,
			rows: [
				{
					columns: [
						{ value: 'src', span: 1, columntype: 'code' },
						{ value: i18nTextModules.ImageLoader.lbl.SrcDescription, span: 5, columntype: 'string', type: 'string' }
					]
				},
				{
					columns: [
						{ value: 'alt', span: 1, columntype: 'code' },
						{ value: i18nTextModules.ImageLoader.lbl.AltDescription, span: 5, columntype: 'string', type: 'string' }
					]
				}
			]
		}
	};

	protected readonly exampleImage = 'assets/demo-feature/images/example.jpg';
}
