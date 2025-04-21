/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit } from '@angular/core';
import { ButtonColorDefinition, ButtonComponent, CardComponent } from '@angular-apps/shared/ui-theme';
import { Router } from '@angular/router';
import { Logger, TranslationPipe } from '@angular-apps/services';
import { AsyncPipe } from '@angular/common';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';

/**
 * Component for displaying a 404 error page.
 */
@Component({
    selector: 'homepage-feature-error404',
    imports: [ButtonComponent, CardComponent, TranslationPipe, AsyncPipe],
    templateUrl: './error404.component.html'
})
export class Error404Component implements OnInit {
	private readonly translationService = inject(ScopedTranslationServiceInterface);
	protected readonly ButtonColorDefinition = ButtonColorDefinition;
	public backToStartpage: string | undefined;

	private readonly logger = new Logger('Error404Component');

	/**
	 * Constructor for Error404Component.
	 * @param {Router} router - The Angular Router service.
	 */
	constructor(private readonly router: Router) {}

	/**
	 * Initializes the component and sets the backToStartpage property with the translated string.
	 */
	ngOnInit(): void {
		this.translationService
			.selectTranslate('Error404Component.lbl.BackToStartpage', 'feature')
			.subscribe((translation) => {
				this.backToStartpage = translation;
			});
	}

	/**
	 * Navigates to the home page.
	 */
	public routeToHome(): void {
		this.router.navigate(['/']).catch((error) => this.logger.error('Error while navigating to home page', error));
	}
}
