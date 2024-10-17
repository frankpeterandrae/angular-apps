import { ButtonComponent, ColorDefinition } from '@angular-apps/shared/ui-theme';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'cr-color-search',
	templateUrl: './color-search.component.html',
	styleUrls: ['./color-search.component.scss'],
	standalone: true,
	imports: [FormsModule, ButtonComponent],
})
export class ColorSearchComponent {
	public searchText = '';
	@Output() public searchEvent = new EventEmitter<string>();

	public onSearch(): void {
		this.searchEvent.emit(this.searchText);
	}

	protected readonly ColorDefinition = ColorDefinition;
}
