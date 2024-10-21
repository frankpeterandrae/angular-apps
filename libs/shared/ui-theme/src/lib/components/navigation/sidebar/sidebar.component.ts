/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '@angular-apps/config';

// Define a type for menu items
interface MenuItem {
	label: string;
	icon?: string;
	route: string;
}

@Component({
	selector: 'theme-sidebar',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
	// Sample menu items
	public menuItems: MenuItem[] = [
		{ label: 'Home', icon: 'home', route: '/home' },
		...(!environment.production ? [{ label: 'Farbregal', icon: 'color', route: '/paint-rack' }] : []),
	];
	protected readonly environment = environment;
}
