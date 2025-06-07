import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	ButtonBarComponent,
	ButtonColorDefinition,
	ButtonConfigModel,
	CardComponent,
} from '@angular-apps/shared/ui-theme';

/**
 * FkttCardsComponent.
 *
 * A feature component that displays a list of cards and provides
 * a button bar for actions such as adding a new card.
 */
@Component({
	selector: 'fktt-cards',
	imports: [CommonModule, CardComponent, ButtonBarComponent],
	templateUrl: './fktt-cards.component.html',
})
export class FkttCardsComponent {
	/**
	 * Configuration array for the button bar.
	 * Each ButtonConfigModel defines the label, icon, style, and click handler.
	 */
	public buttons: ButtonConfigModel[] = [
		{
			buttonText: 'Add Card',
			icon: 'plus',
			color: ButtonColorDefinition.PRIMARY,
			type: 'button',
			/**
			 * Opens the form to create a new LOK card.
			 * Called when the 'Add Card' button is clicked.
			 * @returns {void}
			 */
			callback: (): void => this.showLokCard(),
			iconEnd: false,
			disabled: false,
		},
	];

	/**
	 * Opens the form to create a new LOK card.
	 * Called when the 'Add Card' button is clicked.
	 */
	private showLokCard(): void {
		// do nothing for now
	}
}
