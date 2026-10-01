/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Pipe, PipeTransform, Signal } from '@angular/core';

/**
 * Resolves a string or string signal to its current value.
 */
@Pipe({ name: 'themeUnwrapSignal' })
export class UnwrapSignalPipe implements PipeTransform {
	/**
	 * Transform a string or Signal to a string.
	 * @param {string | Signal<string>} value - The given value.
	 * @returns {string} The string.
	 */
	public transform(value: string | Signal<string>): string {
		return typeof value === 'function' ? value() : value;
	}
}
