/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type OnInit, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BaseComponent, LOGGER_SOURCE, Scopes } from '@application-platform/shared-ui';
import { provideTranslocoScope, translateSignal } from '@jsverse/transloco';

import { i18nTextModules } from '../../i18n/i18n';
import { HomeIntroComponent } from '../home-intro/home-intro.component';

/** Renders the homepage and configures its metadata. */
@Component({
	selector: 'homepage-feature-home',
	imports: [HomeIntroComponent],
	providers: [{ provide: LOGGER_SOURCE, useValue: 'HomeComponent' }, provideTranslocoScope(Scopes.HOMEPAGE_FEATURE)],
	templateUrl: './home.component.html'
})
export class HomeComponent extends BaseComponent implements OnInit {
	private readonly meta = inject(Meta);
	private readonly title = inject(Title);

	private readonly metaTitle = translateSignal(i18nTextModules.HomeComponent.meta.Title);
	private readonly metaDescription = translateSignal(i18nTextModules.HomeComponent.meta.Description);

	ngOnInit(): void {
		this.title.setTitle(this.metaTitle());
		this.meta.addTag({
			name: 'description',
			content: this.metaDescription()
		});
	}
}
