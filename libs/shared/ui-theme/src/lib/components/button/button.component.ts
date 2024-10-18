/*
 * Copyright (c) 2024. Frank-Peter Andrae
 */

import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import { ColorDefinition } from '../../enums';

@Component({
	selector: 'theme-button',
	standalone: true,
	imports: [CommonModule, FaIconComponent],
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
})
export class ButtonComponent implements OnInit {
	public onClick = output();
	public buttonText = input<string>();
	public icon = input<IconDefinition>();
	public color = input.required<ColorDefinition>();
	public iconEnd = input<boolean>(false);

	public buttonClasses: string[] = [];
	public contentClasses: string[] = [];

	ngOnInit(): void {
		if (this.color()) {
			this.buttonClasses.push(`fpa-gradient-${this.color()}`);
			this.contentClasses.push(this.color());
		}

		if (this.iconEnd()) {
			this.contentClasses.push('fpa-df-drr');
		}
	}

	public callback(): void {
		this.onClick.emit();
	}
}