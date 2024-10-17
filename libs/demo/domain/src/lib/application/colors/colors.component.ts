import { Component } from '@angular/core';

@Component({
	selector: 'demo-colors',
	standalone: true,
	imports: [],
	templateUrl: './colors.component.html',
	styleUrl: './colors.component.scss',
})
export class ColorsComponent {
	public colors = ['desert-storm', 'porsche', 'flush-mahogany', 'schooner', 'bastille'];
	public shades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}
