/*
 * Copyright (c) 2024-2025. Frank-Peter Andrä
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
import { BUILD_DATE, environment } from '@angular-apps/config';
import { Logger } from '@angular-apps/services';
import { combineLatest } from 'rxjs';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';
import { Meta } from '@angular/platform-browser';

interface InitializeMenuItemsParams {
	home: string;
	paintRack: string;
	inDevelopment: string;
	test: string;
	fkttCards: string;
	modelRailroad: string;
}

/**
 * The root component of the application.
 */
@Component({
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
	 * @param {Meta} meta - The meta service used to set meta tags.
	 */
	constructor(
		private readonly translocoService: ScopedTranslationServiceInterface,
		private readonly meta: Meta,
	) {
		this.meta.addTags([
			{ name: 'robots', content: 'index, follow' },
			{ name: 'author', content: 'Frank-Peter Andrä' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'date', content: BUILD_DATE, scheme: 'YYYY-MM-DDTHH:mm:ss.sssZ' },
			{ charset: 'UTF-8' },
		]);
	}

	/**
	 * Initializes the component and sets up the menu items with translations.
	 */
	ngOnInit(): void {
		if (environment.production) {
			Logger.setProductionMode({ disable: true });
		}

		combineLatest([
			this.translocoService.selectTranslate('AppComponent.menu.lbl.Home'),
			this.translocoService.selectTranslate('AppComponent.menu.lbl.PaintRack'),
			this.translocoService.selectTranslate('AppComponent.menu.lbl.InDevelopment'),
			this.translocoService.selectTranslate('AppComponent.menu.lbl.Test'),
			this.translocoService.selectTranslate('AppComponent.menu.lbl.FkttCards'),
			this.translocoService.selectTranslate('AppComponent.menu.lbl.ModelRailroad'),
		]).subscribe(([home, paintRack, inDevelopment, test, fkttCards, modelRailroad]) => {
			this.initializeMenuItems({ home, paintRack, inDevelopment, test, fkttCards, modelRailroad });
		});
	}

	/**
	 * Initializes the menu items with the provided translations.
	 * @param { InitializeMenuItemsParams } menuLabels - An object containing the translated labels for the menu items.
	 */
	private initializeMenuItems(menuLabels: InitializeMenuItemsParams): void {
		this.menuItems = [
			{
				label: menuLabels.home,
				icon: IconDefinition.HOUSE,
				route: '/',
			},
			{
				label: menuLabels.paintRack,
				icon: IconDefinition.PALETTE,
				route: '/paint-rack',
			},
			...(!environment.production
				? [
						{
							label: menuLabels.inDevelopment,
							icon: IconDefinition.PALETTE,
							route: '/dev',
							children: [{ label: menuLabels.test, route: '/dev/test' }],
						},
						{
							label: menuLabels.modelRailroad,
							icon: IconDefinition.PALETTE,
							route: '/dev/Lokkarten',
							children: [{ label: menuLabels.fkttCards, route: '/dev/Lokkarten' }],
						},
					]
				: []),
		];
	}
}
