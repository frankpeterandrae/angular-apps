/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent, IconDefinition, InputComponent } from '@application-platform/shared/ui-theme';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

/** Displays input usage examples. */
@Component({
	selector: 'demo-input',
	imports: [InputComponent, DemoThemeContainerComponent, ReactiveFormsModule, CardComponent, JsonPipe],
	templateUrl: './input-demo.component.html'
})
export class InputDemoComponent {
	protected readonly IconDefinition = IconDefinition;

	protected readonly demoForm = new FormGroup({
		textInput: new FormControl('', [Validators.required]),
		emailInput: new FormControl('', [Validators.required, Validators.email]),
		passwordInput: new FormControl('', [Validators.required, Validators.minLength(8)]),
		iconInput: new FormControl(''),
		disabledInput: new FormControl({ value: 'Disabled input', disabled: true })
	});

	protected readonly description: Description = {
		title: i18nTextModules.Input.lbl.Title,
		description: i18nTextModules.Input.lbl.Description,
		usage: String.raw`<theme-input\n\t[label]="'Email'"\n\t[type]="'email'"\n\t[placeholder]="'Enter your email'"\n\t[icon]="IconDefinition.SEARCH"\n\t[disabled]="false"\n\t[formControl]="emailControl"\n></theme-input>`,
		definition: {
			span: 12,
			rows: [
				{
					columns: [
						{ value: 'label', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Input.lbl.LabelDescription,
							span: 5,
							columntype: 'string',
							type: 'string'
						}
					]
				},
				{
					columns: [
						{ value: 'type', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Input.lbl.TypeDescription,
							span: 5,
							columntype: 'string',
							type: 'string'
						}
					]
				},
				{
					columns: [
						{ value: 'placeholder', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Input.lbl.PlaceholderDescription,
							span: 5,
							columntype: 'string',
							type: 'string'
						}
					]
				},
				{
					columns: [
						{ value: 'icon', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Input.lbl.IconDescription,
							span: 5,
							columntype: 'string',
							type: 'IconDefinition'
						}
					]
				},
				{
					columns: [
						{ value: 'disabled', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.Input.lbl.DisabledDescription,
							span: 5,
							columntype: 'string',
							type: 'boolean'
						}
					]
				}
			]
		}
	};
}
