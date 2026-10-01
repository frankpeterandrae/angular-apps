/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { TooltipDirective } from '@application-platform/shared/ui-theme';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

/** Displays tooltip usage examples. */
@Component({
	selector: 'demo-tooltip',
	imports: [TooltipDirective, DemoThemeContainerComponent],
	templateUrl: './tooltip-demo.component.html'
})
export class TooltipDemoComponent {
	protected readonly description: Description = {
		title: i18nTextModules.Tooltip.lbl.Title,
		description: i18nTextModules.Tooltip.lbl.Description,
		usage: '<button\n' + '\t[themeTooltip]="\'This is a helpful tooltip\'"\n' + '>\n' + '\tHover me\n' + '</button>',
		language: 'html',
		definition: {
			span: 12,
			rows: [
				{
					columns: [
						{ value: 'themeTooltip', span: 1, columntype: 'code' },
						{ value: i18nTextModules.Tooltip.lbl.TooltipTextDescription, span: 5, columntype: 'string', type: 'string' }
					]
				}
			]
		}
	};
}
