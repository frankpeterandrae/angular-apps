/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { ColorDefinition } from '../../enums';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

@Component({
	selector: 'theme-button',
	standalone: true,
	imports: [CommonModule, FastSvgComponent],
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
})
export class ButtonComponent implements OnInit {
	public onClick = output();
	public buttonText = input<string>();
	public icon = input<string>();
	public color = input.required<ColorDefinition>();
	public iconEnd = input<boolean>(false);
	public disabled = input<boolean>(false);
	public type = input<'submit' | 'reset' | 'button'>('button');

	public buttonClasses: string[] = [];
	public contentClasses: string[] = [];

	ngOnInit(): void {
		if (this.color()) {
			this.buttonClasses.push(`fpa-gradient-${this.color()}`);
			this.contentClasses.push(this.color());
		}

		if (this.iconEnd()) {
			this.contentClasses.push('fpa-df-direction-row-reverse');
		}
	}

	public callback(): void {
		this.onClick.emit();
	}
}
