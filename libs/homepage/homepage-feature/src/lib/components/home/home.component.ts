/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { Meta, Title } from '@angular/platform-browser';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

/**
 * Component representing the homepage feature.
 */
@Component({
	selector: 'homepage-feature',
	standalone: true,
	imports: [HeroComponent],
	templateUrl: './home.component.html',
})
export class HomeComponent {
	/**
	 * Constructor for HomeComponent.
	 * @param {Meta} meta - The meta service used to set meta tags.
	 * @param {Title} title - The title service used to set the title.
	 * @param {ScopedTranslationServiceInterface} translocoService - The translation service used for fetching translations.
	 */
	constructor(
		private readonly meta: Meta,
		private readonly title: Title,
		private readonly translocoService: ScopedTranslationServiceInterface,
	) {
		this.translocoService.selectTranslate('HomeComponent.meta.Title', 'feature').subscribe((translation) => {
			this.title.setTitle(translation);
		});

		this.translocoService.selectTranslate('HomeComponent.meta.Description', 'feature').subscribe((translation) => {
			this.meta.addTag({ name: 'description', content: translation });
		});
	}
}
