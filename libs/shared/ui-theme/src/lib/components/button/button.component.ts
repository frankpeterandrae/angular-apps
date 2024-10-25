/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output } from '@angular/core';
import { ColorDefinition } from '../../enums';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';

/**
 * ButtonComponent is a reusable button component with customizable properties.
 */
@Component({
	selector: 'theme-button',
	standalone: true,
	imports: [CommonModule, FastSvgComponent],
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
})
export class ButtonComponent implements OnInit {
	/** Event emitter for button click events */
	public onClick = output();

	/** Text to be displayed on the button */
	public buttonText = input<string>();

	/** Icon to be displayed on the button */
	public icon = input<string>();

	/** Color definition for the button */
	public color = input.required<ColorDefinition>();

	/** Flag to determine if the icon should be displayed at the end */
	public iconEnd = input<boolean>(false);

	/** Flag to disable the button */
	public disabled = input<boolean>(false);

	/** Type of the button (submit, reset, button) */
	public type = input<'submit' | 'reset' | 'button'>('button');

	/** CSS classes for the button element */
	public buttonClasses: string[] = [];

	/** CSS classes for the content inside the button */
	public contentClasses: string[] = [];

	/**
	 * Lifecycle hook that is called after data-bound properties are initialized.
	 */
	ngOnInit(): void {
		if (this.color()) {
			this.buttonClasses.push(`fpa-gradient-${this.color()}`);
			this.contentClasses.push(this.color());
		}

		if (this.iconEnd()) {
			this.contentClasses.push('fpa-df-direction-row-reverse');
		}
	}

	/**
	 * Callback function to emit the click event.
	 */
	public callback(): void {
		this.onClick.emit();
	}
}
