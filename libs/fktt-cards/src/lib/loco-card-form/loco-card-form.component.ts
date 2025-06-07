import { Component, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { LocoCardModel } from '../model/loco-card.model';
import { InputComponent, SelectComponent, SelectOption, TextareaComponent } from '@angular-apps/shared/ui-theme';
import { LocoTypeEnum } from '../model/loco-type.enum';

/**
 * TODO.
 */
@Component({
	selector: 'fktt-loco-card-form',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, TextareaComponent],
	templateUrl: './loco-card-form.component.html',
	styleUrl: './loco-card-form.component.scss',
})
export class LocoCardFormComponent implements OnInit {
	public locoCardForm!: FormGroup;

	/** Emits when the form is submitted with valid data. */
	public readonly locoCardSubmit = output<LocoCardModel>();
	public locoCardTypes: SelectOption[] = [];

	/**
	 * Injects the FormBuilder service.
	 * @param { FormBuilder } fb - The FormBuilder instance used to create the form group.
	 */
	constructor(private fb: FormBuilder) {}
	/**
	 * TODO.
	 */
	ngOnInit(): void {
		this.generateSelectOptions();
		this.intiForm();
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
			use: [[]],
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
					value: LocoTypeEnum[key as keyof typeof LocoTypeEnum],
				});
			}
		}
	}
}
