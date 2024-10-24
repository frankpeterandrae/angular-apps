/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import {
	FooterComponent,
	HeaderComponent,
	IconDefinition,
	MenuItem,
	SidebarComponent,
} from '@angular-apps/shared/ui-theme';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '@angular-apps/config';

@Component({
	standalone: true,
	imports: [SidebarComponent, RouterOutlet, HeaderComponent, FooterComponent],
	selector: 'fpa-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	public title = 'homepage';

	public menuItems: MenuItem[] = [
		{ label: 'Home', icon: IconDefinition.house, route: '/home' },
		...(!environment.production ? [{ label: 'Farbregal', icon: IconDefinition.palette, route: '/paint-rack' }] : []),
		...(!environment.production
			? [
					{
						label: 'Test',
						icon: IconDefinition.palette,
						route: '/test',
						children: [{ label: 'child', route: '/test/child' }],
					},
				]
			: []),
	];
}
