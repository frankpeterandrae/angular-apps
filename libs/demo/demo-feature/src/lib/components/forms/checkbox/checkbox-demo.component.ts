/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { CheckboxColorDefinition, CheckboxGroupComponent } from '@application-platform/shared/ui-theme';
import { Scopes, TranslationPipe } from '@application-platform/shared-ui';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

/** Displays checkbox group usage examples. */
@Component({
	selector: 'demo-checkbox',
	imports: [CheckboxGroupComponent, DemoThemeContainerComponent, TranslationPipe],
	templateUrl: './checkbox-demo.component.html'
})
export class CheckboxDemoComponent {
	protected readonly i18nTextModules = i18nTextModules;
	protected readonly Scopes = Scopes;
	protected readonly CheckboxColorDefinition = CheckboxColorDefinition;

	protected readonly description: Description = {
		title: i18nTextModules.Checkbox.lbl.Title,
		description: i18nTextModules.Checkbox.lbl.Description,
		usage: String.raw`<theme-checkbox-group\n\t[label]="'My Checkbox Group'"\n\t[checkboxes]="checkboxes"\n></theme-checkbox-group>`,
		definition: {
			span: 12,
			rows: [
				{
					columns: [
						{ value: 'label', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Checkbox.lbl.LabelDescription,
							span: 5,
							columntype: 'string',
							type: 'string',
							optional: true
						}
					]
				},
				{
					columns: [
						{ value: 'checkboxes', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Checkbox.lbl.CheckboxesDescription,
							span: 5,
							columntype: 'string',
							type: 'CheckboxConfig[]'
						}
					]
				}
			]
		}
	};
}
