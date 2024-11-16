/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit } from '@angular/core';
import { ButtonColorDefinition, ButtonComponent, CardComponent } from '@angular-apps/shared/ui-theme';
import { Router } from '@angular/router';
import { ScopedTranslationService, TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';

/**
 * Component for displaying a 404 error page.
 */
@Component({
	selector: 'homepage-feature-error404',
	standalone: true,
	imports: [ButtonComponent, CardComponent, TranslationPipe, AsyncPipe],
	templateUrl: './error404.component.html',
})
export class Error404Component implements OnInit {
	private readonly translationService = inject(ScopedTranslationService);
	protected readonly ButtonColorDefinition = ButtonColorDefinition;
	public backtoStartpage: string | undefined;

	/**
	 * Constructor for Error404Component.
	 * @param router - The Angular Router service.
	 */
	constructor(private readonly router: Router) {}

	/**
	 * Initializes the component and sets the backtoStartpage property with the translated string.
	 */
	ngOnInit(): void {
		this.translationService.translate('Error404Component.lbl.BackToStartpage', 'feature').subscribe((translation) => {
			this.backtoStartpage = translation;
		});
	}

	/**
	 * Navigates to the home page.
	 */
	public routeToHome(): void {
		// TODO: Add Logger
		// eslint-disable-next-line no-console
		this.router.navigate(['/']).catch((error) => console.error(error));
	}
}
