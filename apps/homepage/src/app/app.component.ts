import { SidebarComponent } from '@angular-apps/shared/ui-theme';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	standalone: true,
	imports: [SidebarComponent, RouterOutlet],
	selector: 'fpa-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	public title = 'homepage';
}
