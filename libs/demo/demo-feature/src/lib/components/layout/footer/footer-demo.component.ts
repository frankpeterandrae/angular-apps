/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { FooterComponent } from '@application-platform/shared/ui-theme';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

/** Displays footer usage examples. */
@Component({
	selector: 'demo-footer',
	imports: [FooterComponent, DemoThemeContainerComponent],
	templateUrl: './footer-demo.component.html'
})
export class FooterDemoComponent {
	protected readonly description: Description = {
		title: i18nTextModules.Footer.lbl.Title,
		description: i18nTextModules.Footer.lbl.Description,
		usage: '<theme-footer></theme-footer>',
		language: 'html'
	};
}
