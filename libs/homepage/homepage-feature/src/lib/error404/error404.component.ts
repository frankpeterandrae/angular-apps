/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject, OnInit } from '@angular/core';
import { ButtonColorDefinition, ButtonComponent, CardComponent } from '@angular-apps/shared/ui-theme';
import { Router } from '@angular/router';
import { Logger, ScopedTranslationService, TranslationPipe } from '@angular-apps/services';
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

	private readonly logger = new Logger('Error404Component');

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
		this.router.navigate(['/']).catch((error) => this.logger.error('Error while navigating to home page', error));
	}
}
