import { Directive, input } from '@angular/core';

/**
 *
 */
@Directive({
	selector: 'label[themeFloatingLabel]',
	host: {
		class: 'fpa-floating-label',
		'[class.fpa-floating-label-float-above]': 'floating()',
	},
})
export class FloatingLabelDirective {
	public floating = input<boolean>(false);
}
