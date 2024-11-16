/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit } from '@angular/core';
import { ScopedTranslationService, TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';

/**
 * Component decorator for defining the HeroComponent.
 */
@Component({
	selector: 'homepage-feature-hero',
	standalone: true,
	templateUrl: './hero.component.html',
	styleUrl: './hero.component.scss',
	imports: [TranslationPipe, AsyncPipe],
})
export class HeroComponent implements OnInit {
	private readonly translocoService = inject(ScopedTranslationService);

	/**
	 * The translated paragraph text.
	 */
	public paragraph: string | undefined;

	/**
	 * Initializes the component and sets the translated paragraph text.
	 */
	ngOnInit(): void {
		this.translocoService.translate('HeroComponent.lbl.Paragraph1', 'feature').subscribe((translation) => {
			this.paragraph = translation;
		});
	}
}
