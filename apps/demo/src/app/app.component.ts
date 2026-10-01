/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
	DropdownOption,
	DropdownSelectComponent,
	FooterComponent,
	HeaderComponent,
	IconDefinition
} from '@application-platform/shared/ui-theme';

type Theme = 'homepage' | 'z21';

/** Root component of the demo application. */
@Component({
	imports: [RouterOutlet, HeaderComponent, DropdownSelectComponent, FooterComponent],
	selector: 'demo-root',
	templateUrl: './app.component.html'
})
export class AppComponent {
	private readonly themeStylesheetId = 'homepage-theme';
	private themeStylesheet = document.getElementById(this.themeStylesheetId) as HTMLLinkElement | null;

	protected readonly selectedTheme = signal<Theme>('homepage');

	protected readonly themeOptions: DropdownOption<Theme>[] = [
		{ value: 'homepage', label: 'Homepage', icon: IconDefinition.COMPUTER },
		{ value: 'z21', label: 'Z21', icon: IconDefinition.Z21 }
	];

	constructor() {
		this.setTheme('homepage');
	}

	protected setTheme(theme: Theme | null): void {
		if (theme === null) {
			return;
		}

		this.selectedTheme.set(theme);

		const existing = document.getElementById(this.themeStylesheetId) as HTMLLinkElement | null;
		if (existing) {
			this.themeStylesheet = existing;
		}

		if (!this.themeStylesheet?.isConnected) {
			this.themeStylesheet = document.createElement('link');
			this.themeStylesheet.id = this.themeStylesheetId;
			this.themeStylesheet.rel = 'stylesheet';
			document.head.appendChild(this.themeStylesheet);
		}

		this.themeStylesheet.href = `${theme}-theme.css`;
	}
}
