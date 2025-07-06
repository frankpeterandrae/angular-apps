/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, ElementRef, forwardRef, input, model, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Todo.
 */
@Component({
	selector: 'theme-checkbox',
	imports: [CommonModule],
	templateUrl: './checkbox.component.html',
	styleUrl: './checkbox.component.scss',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CheckboxComponent),
			multi: true,
		},
	],
})
export class CheckboxComponent implements ControlValueAccessor {
	/** Optional id for the input element. */
	public id = input<string>('');

	/** Reference to the input element. */
	public readonly inputElement = viewChild.required<ElementRef>('input');
	public label = input<string>('');
	public disabled = input<boolean>(false);

	// Define output using the `output` function
	public valueChange = output<string>();

	public value = model<string>('');
	/**
	 * Callback function to handle changes in the input value.
	 */
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public onChange: (value: string) => void = () => {};
	/**
	 * Callback function to handle touch events on the input.
	 */
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public onTouched: () => void = () => {};

	/**
	 * Handles the change event on the input field.
	 * @param {string} $event - The change event.
	 */
	public onChangeValue($event: string): void {
		this.value.update(() => $event);
	}

	/**
	 * Registers a callback function to be called when the input value changes.
	 * @internal
	 * @param {any} fn - The callback function.
	 */
	public registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	/**
	 * Registers a callback function to be called when the input is touched.
	 * @internal
	 * @param {any} fn - The callback function.
	 */
	public registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	/**
	 * Writes a new value to the input field.
	 * @internal
	 * @param {string} value - The new value.
	 */
	public writeValue(value: string): void {
		this.value.update(() => value);
	}

	/**
	 * Handles the input event and updates the component's value.
	 * @param {Event} event - The input event.
	 */
	public onInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		this.value.update(() => input.value);
		this.onChange(this.value());
		this.valueChange.emit(this.value());
	}
}
