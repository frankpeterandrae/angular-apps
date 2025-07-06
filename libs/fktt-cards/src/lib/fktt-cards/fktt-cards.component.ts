import { Component, ViewEncapsulation } from '@angular/core';
import { TabComponent, TabGroupComponent } from '@angular-apps/shared/ui-theme';
import { LocoCardFormComponent } from '../loco-card-form/loco-card-form.component';
import { FrightCarFormComponent } from '../fright-car-card-form/fright-car-form.component';
import { LocoCardModel } from '../model/loco-card.model';

/**
 * FkttCardsComponent.
 *
 * A feature component that displays a list of cards and provides
 * a button bar for actions such as adding a new card.
 */
@Component({
	selector: 'fktt-cards',
	imports: [TabGroupComponent, TabComponent, LocoCardFormComponent, FrightCarFormComponent],
	templateUrl: './fktt-cards.component.html',
	styleUrls: ['./fktt-cards.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class FkttCardsComponent {
	/** Collected loco cards submissions. */
	public locoCards: LocoCardModel[] = [];

	/**
	 * Handles a submitted loco card.
	 * @param { LocoCardModel } card - The loco card that was submitted.
	 */
	public onLocoCardSubmit(card: LocoCardModel): void {
		this.locoCards.push(card);
	}
}
