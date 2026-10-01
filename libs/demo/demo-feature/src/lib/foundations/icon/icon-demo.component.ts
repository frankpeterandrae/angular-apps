/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { IconDefinition, TooltipDirective } from '@application-platform/shared/ui-theme';
import { Scopes, TranslationPipe } from '@application-platform/shared-ui';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

import { DemoThemeContainerComponent } from '../../components/demo-theme-container.component';
import { Description } from '../../components/description';
import { i18nTextModules } from '../../i18n/i18n';

/** Displays all available theme icons. */
@Component({
	selector: 'demo-icon',
	imports: [FastSvgComponent, TooltipDirective, DemoThemeContainerComponent, TranslationPipe],
	templateUrl: './icon-demo.component.html'
})
export class IconDemoComponent {
	protected readonly i18nTextModules = i18nTextModules;
	protected readonly IconDefinition = IconDefinition;
	protected readonly Scopes = Scopes;
	protected readonly icons = Object.values(IconDefinition).filter((icon) => icon !== IconDefinition.NONE);

	protected readonly description: Description = {
		title: i18nTextModules.Icon.lbl.Title,
		description: i18nTextModules.Icon.lbl.Description,
		usage: '<fast-svg\n' + '\tclass="fpa-color-main-band"\n' + '\t[name]="IconDefinition.SEARCH"\n' + '\t[size]="\'32\'"\n' + '/>'
	};
}
