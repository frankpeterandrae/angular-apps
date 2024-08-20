import { ColorsComponent } from '@angular-monorepo/demo/domain';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	standalone: true,
	imports: [CommonModule, ColorsComponent],
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	title = 'demo';
}
