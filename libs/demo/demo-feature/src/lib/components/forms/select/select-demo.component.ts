/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from '@application-platform/shared/ui-theme';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

interface SelectOption {
	label: string;
	value: string;
}

/** Displays select usage examples. */
@Component({
	selector: 'demo-select',
	imports: [SelectComponent, DemoThemeContainerComponent, ReactiveFormsModule],
	templateUrl: './select-demo.component.html'
})
export class SelectDemoComponent {
	protected readonly selectForm = new FormGroup<{ country: FormControl<string> }>({
		country: new FormControl<string>('', { nonNullable: true })
	});

	protected readonly countryOptions: SelectOption[] = [
		{ label: 'Germany', value: 'de' },
		{ label: 'United States', value: 'us' },
		{ label: 'United Kingdom', value: 'uk' },
		{ label: 'France', value: 'fr' },
		{ label: 'Spain', value: 'es' }
	];

	protected get selectControl(): FormControl<string> {
		return this.selectForm.controls.country;
	}

	protected get currentValue(): string {
		return this.selectControl.value;
	}

	protected readonly description: Description = {
		title: i18nTextModules.Select.lbl.Title,
		description: i18nTextModules.Select.lbl.Description,
		usage: String.raw`<theme-select\n\t[label]="'Select Country'"\n\t[options]="countryOptions"\n\t[formControl]="countryControl"\n></theme-select>`,
		language: 'html',
		definition: {
			span: 12,
			rows: [
				{
					columns: [
						{ value: 'label', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Select.lbl.LabelDescription,
							span: 5,
							columntype: 'string',
							type: 'string'
						}
					]
				},
				{
					columns: [
						{ value: 'options', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Select.lbl.OptionsDescription,
							span: 5,
							columntype: 'string',
							type: 'SelectOption[]'
						}
					]
				},
				{
					columns: [
						{ value: 'formControl', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Select.lbl.FormControlDescription,
							span: 5,
							columntype: 'string',
							type: 'FormControl'
						}
					]
				},
				{
					columns: [
						{ value: 'multiple', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Select.lbl.MultipleDescription,
							span: 5,
							columntype: 'string',
							type: 'boolean',
							optional: true
						}
					]
				},
				{
					columns: [
						{ value: 'isDynamic', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Select.lbl.IsDynamicDescription,
							span: 5,
							columntype: 'string',
							type: 'boolean',
							optional: true
						}
					]
				}
			]
		}
	};
}
