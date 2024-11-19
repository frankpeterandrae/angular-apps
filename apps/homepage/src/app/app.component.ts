/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import {
	FooterComponent,
	HeaderComponent,
	IconDefinition,
	LanguageToggleComponent,
	MenuItem,
} from '@angular-apps/shared/ui-theme';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '@angular-apps/config';
import { Logger } from '@angular-apps/services';
import { combineLatest } from 'rxjs';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

/**
 * The root component of the application.
 */
@Component({
	standalone: true,
	imports: [RouterOutlet, HeaderComponent, FooterComponent, LanguageToggleComponent],
	selector: 'fpa-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	/**
	 * The menu items to be displayed in the sidebar.
	 * @type {MenuItem[]}
	 */
	public menuItems: MenuItem[] = [];

	/**
	 * Creates an instance of AppComponent.
	 * @param {ScopedTranslationServiceInterface} translocoService - The translation service used for fetching translations.
	 */
	constructor(private readonly translocoService: ScopedTranslationServiceInterface) {
		// Ensure a language is set
	}

	/**
	 * Initializes the component and sets up the menu items with translations.
	 */
	ngOnInit(): void {
		if (environment.production) {
			Logger.setProductionMode({ disable: true });
		}

		combineLatest([
			this.translocoService.translate('AppComponent.menu.lbl.Home'),
			this.translocoService.translate('AppComponent.menu.lbl.PaintRack'),
			this.translocoService.translate('AppComponent.menu.lbl.InDevelopment'),
			this.translocoService.translate('AppComponent.menu.lbl.Test'),
		]).subscribe(([home, paintRack, inDevelopment, test]) => {
			this.initializeMenuItems(home, paintRack, inDevelopment, test);
		});
	}

	/**
	 * Initializes the menu items with the provided translations.
	 * @param {string} home - The translation for the home menu item.
	 * @param {string} paintRack - The translation for the paint rack menu item.
	 * @param {string} inDevelopment - The translation for the in development menu item.
	 * @param {string} test - The translation for the test menu item.
	 */
	private initializeMenuItems(home: string, paintRack: string, inDevelopment: string, test: string): void {
		this.menuItems = [
			{
				label: home,
				icon: IconDefinition.HOUSE,
				route: '/home',
			},
			{
				label: paintRack,
				icon: IconDefinition.PALETTE,
				route: '/paint-rack',
			},
			...(!environment.production
				? [
						{
							label: inDevelopment,
							icon: IconDefinition.PALETTE,
							route: '/dev',
							children: [{ label: test, route: '/dev/test' }],
						},
					]
				: []),
		];
	}
}
