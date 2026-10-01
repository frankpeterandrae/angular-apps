/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RangeInput, RangeInputComponent } from '@application-platform/shared/ui-theme';

import { i18nTextModules } from '../../../i18n/i18n';
import { DemoThemeContainerComponent } from '../../demo-theme-container.component';
import { Description } from '../../description';

/** Displays range input usage examples. */
@Component({
	selector: 'demo-range-input',
	imports: [RangeInputComponent, DemoThemeContainerComponent, ReactiveFormsModule],
	templateUrl: './range-input-demo.component.html'
})
export class RangeInputDemoComponent {
	protected readonly rangeForm = new FormGroup<{ priceRange: FormControl<RangeInput> }>({
		priceRange: new FormControl<RangeInput>({ from: '100', to: '1000' }, { nonNullable: true })
	});

	protected get priceRangeControl(): FormControl<RangeInput> {
		return this.rangeForm.controls.priceRange;
	}

	protected get currentFrom(): string {
		return this.priceRangeControl.value.from;
	}

	protected get currentTo(): string {
		return this.priceRangeControl.value.to;
	}

	protected readonly description: Description = {
		title: i18nTextModules.RangeInput.lbl.Title,
		description: i18nTextModules.RangeInput.lbl.Description,
		usage: String.raw`<theme-range-input\n\t[label]="'Price Range'"\n\t[formControl]="priceRangeControl"\n></theme-range-input>`,
		language: 'html',
		definition: {
			span: 12,
			rows: [
				{
					columns: [
						{ value: 'label', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.RangeInput.lbl.LabelDescription,
							span: 5,
							columntype: 'string',
							type: 'string'
						}
					]
				},
				{
					columns: [
						{ value: 'formControl', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.RangeInput.lbl.FormControlDescription,
							span: 5,
							columntype: 'string',
							type: 'FormControl'
						}
					]
				},
				{
					columns: [
						{ value: 'valueChange', span: 1, columntype: 'code' },
						{
							value: i18nTextModules.RangeInput.lbl.ValueChangeDescription,
							span: 5,
							columntype: 'string',
							type: 'OutputEmitterRef<RangeInput>',
							optional: true
						}
					]
				}
			]
		}
	};
}
