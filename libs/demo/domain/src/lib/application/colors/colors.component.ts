import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	selector: 'demo-colors',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './colors.component.html',
	styleUrl: './colors.component.scss',
})
export class ColorsComponent {
	colors = ['desert-storm', 'porsche', 'flush-mahogany', 'schooner', 'bastille'];
	shades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}
