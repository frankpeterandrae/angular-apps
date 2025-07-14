/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit } from '@angular/core';
import { TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

/**
 * Component decorator for defining the HeroComponent.
 */
@Component({
	selector: 'homepage-feature-hero',
	templateUrl: './hero.component.html',
	styleUrl: './hero.component.scss',
	imports: [TranslationPipe, AsyncPipe]
})
export class HeroComponent implements OnInit {
	private readonly translocoService = inject(ScopedTranslationServiceInterface);

	/**
	 * The translated paragraph text.
	 */
	public paragraph: string | undefined;

	/**
	 * Initializes the component and sets the translated paragraph text.
	 */
	ngOnInit(): void {
		this.translocoService.selectTranslate('HeroComponent.lbl.Paragraph1', 'feature').subscribe((translation) => {
			this.paragraph = translation;
		});
	}
}
