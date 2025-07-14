/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LocoCardModel } from '../model/loco-card.model';
import {
	CheckboxColorDefinition,
	CheckboxConfig,
	CheckboxGroupComponent,
	InputComponent,
	SelectComponent,
	SelectOption,
	TextareaComponent
} from '@angular-apps/shared/ui-theme';
import { LocoTypeEnum } from '../model/loco-type.enum';
import { fkttCardsTextModules } from '../i18n/i18n';
import { BaseComponent } from '@angular-apps/shared-ui';

/**
 * TODO.
 */
@Component({
	selector: 'fktt-loco-card-form',
	imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TextareaComponent, CheckboxGroupComponent],
	templateUrl: './loco-card-form.component.html',
	styleUrl: './loco-card-form.component.scss'
})
export class LocoCardFormComponent extends BaseComponent implements OnInit {
	private readonly fb = inject(FormBuilder);
	public readonly fkttCardsTextModules = fkttCardsTextModules;
	public locoCardForm: FormGroup = {} as FormGroup;

	private translationKeys = [
		fkttCardsTextModules.LocoCard.lbl.Type,
		fkttCardsTextModules.LocoCard.lbl.CardNumber,
		fkttCardsTextModules.LocoCard.lbl.RailroadAdministration,
		fkttCardsTextModules.LocoCard.lbl.UsedFor,
		fkttCardsTextModules.LocoCard.lbl.Passenger,
		fkttCardsTextModules.LocoCard.lbl.Freight,
		fkttCardsTextModules.LocoCard.lbl.Shunting
	];

	/** Emits when the form is submitted with valid data. */
	public readonly locoCardSubmit = output<LocoCardModel>();
	public locoCardTypes: SelectOption[] = [];

	public checkboxes = computed(() => [
		{
			label: this.getTranslation(fkttCardsTextModules.LocoCard.lbl.Passenger),
			id: 'P',
			value: 'P',
			color: CheckboxColorDefinition.CRIMSON
		},
		{
			label: this.getTranslation(fkttCardsTextModules.LocoCard.lbl.Freight),
			id: 'G',
			value: 'G',
			color: CheckboxColorDefinition.CRIMSON
		},
		{
			label: this.getTranslation(fkttCardsTextModules.LocoCard.lbl.Shunting),
			id: 'R',
			value: 'R',
			color: CheckboxColorDefinition.CRIMSON
		}
	]);

	/**
	 * TODO.
	 */
	ngOnInit(): void {
		this.generateSelectOptions();
		this.intiForm();
		this._translationKeys.set(this.translationKeys);
	}

	/**
	 * TODO.
	 */
	private intiForm(): void {
		this.locoCardForm = this.fb.group({
			owner: [''],
			image: [''],
			cardNumber: [''],
			colorCode: [''],
			manufacturer: [''],
			operatingNumber: [''],
			epoch: [''],
			railroadAdministration: [''],
			description: [''],
			clutch: [''],
			lengthOverBuffer: [''],
			mass: [''],
			dccAddress: [''],
			type: [''],
			usedFor: [[]],
			useFrom: [''],
			useTo: ['']
		});
	}

	/** Submit handler. */
	public onSubmit(): void {
		if (this.locoCardForm.valid) {
			this.locoCardSubmit.emit(this.locoCardForm.value as LocoCardModel);
		}
	}

	/**
	 * Generates the select options for loco card types.
	 */
	private generateSelectOptions(): void {
		for (const key in LocoTypeEnum) {
			if (isNaN(Number(key))) {
				this.locoCardTypes.push({
					label: key,
					value: LocoTypeEnum[key as keyof typeof LocoTypeEnum]
				});
			}
		}
	}
}
