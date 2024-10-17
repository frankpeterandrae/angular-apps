import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
		{ label: 'Farbregal', icon: 'color', route: '/paint-rack' },
		// Add more items as needed
	];
}
