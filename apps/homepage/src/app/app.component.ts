/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { FooterComponent, HeaderComponent, SidebarComponent } from '@angular-apps/shared/ui-theme';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	standalone: true,
	imports: [SidebarComponent, RouterOutlet, HeaderComponent, FooterComponent],
	selector: 'fpa-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	public title = 'homepage';
}
