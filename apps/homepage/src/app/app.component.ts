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

/**
 * The root component of the application.
 */
@Component({
	standalone: true,
	imports: [SidebarComponent, RouterOutlet, HeaderComponent, FooterComponent],
	selector: 'fpa-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	/**
	 * The title of the application.
	 */
	public title = 'homepage';

	/**
	 * The menu items to be displayed in the sidebar.
	 * @type {MenuItem[]}
	 */
	public menuItems: MenuItem[] = [
		{ label: 'Home', icon: IconDefinition.house, route: '/home' },
		...(!environment.production
			? [
					{
						label: 'In Entwicklung',
						icon: IconDefinition.palette,
						route: '/dev',
						children: [
							{ label: 'Farbregal', icon: IconDefinition.palette, route: '/dev/paint-rack' },
							{ label: 'child', route: '/dev/test' },
						],
					},
				]
			: []),
	];
}
