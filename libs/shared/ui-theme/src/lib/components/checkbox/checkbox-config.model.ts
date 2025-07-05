export interface CheckboxConfig {
	label: string;
	id: string;
	value: string;
	disabled: boolean;
	onInput: (value: Event) => void;
}
