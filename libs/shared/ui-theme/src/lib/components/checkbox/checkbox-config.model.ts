/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

export interface CheckboxConfig {
	label: string;
	id: string;
	value: string;
	disabled: boolean;
	onInput: (value: Event) => void;
}
