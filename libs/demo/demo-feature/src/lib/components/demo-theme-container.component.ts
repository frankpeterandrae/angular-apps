/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ɵSharedStylesHost } from '@angular/platform-browser';
import { CardComponent, MenuItem, SidebarComponent } from '@application-platform/shared/ui-theme';
import { Scopes, TranslationPipe } from '@application-platform/shared-ui';

import { i18nTextModules } from '../i18n/i18n';
import { PrismComponent } from '../shared/prism/prism.component';

import { Description } from './description';

/** Provides the shared layout and documentation sections for demo pages. */
@Component({
	selector: 'demo-theme',
	imports: [NgTemplateOutlet, SidebarComponent, CardComponent, TranslationPipe, PrismComponent],
	providers: [TranslationPipe],
	styleUrls: ['./demo-theme-container.component.scss'],
	templateUrl: './demo-theme-container.component.html'
})
export class DemoThemeContainerComponent {
	private readonly sharedStylesHost = inject(ɵSharedStylesHost);
	private readonly translationPipe = inject(TranslationPipe);

	public readonly description = input<Description>({ title: '', description: '' });

	constructor() {
		this.sharedStylesHost.addStyles([], ['/assets/demo-feature/css/prism.css']);
	}

	protected get menuItems(): MenuItem[] {
		return [
			{ id: 'button', label: this.translate(i18nTextModules.Button.lbl.Title), route: '../button' },
			{ id: 'buttonBar', label: this.translate(i18nTextModules.ButtonBar.lbl.Title), route: '../button-bar' },
			{ id: 'card', label: this.translate(i18nTextModules.Card.lbl.Title), route: '../card' },
			{ id: 'checkbox', label: this.translate(i18nTextModules.Checkbox.lbl.Title), route: '../checkbox' },
			{ id: 'colors', label: this.translate(i18nTextModules.Colors.lbl.Title), route: '../colors' },
			{ id: 'dialog', label: this.translate(i18nTextModules.Dialog.lbl.Title), route: '../dialog' },
			{ id: 'dropdown', label: this.translate(i18nTextModules.Dropdown.lbl.Title), route: '../dropdown-select' },
			{ id: 'footer', label: this.translate(i18nTextModules.Footer.lbl.Title), route: '../footer' },
			{ id: 'header', label: this.translate(i18nTextModules.Header.lbl.Title), route: '../header' },
			{ id: 'icons', label: this.translate(i18nTextModules.Icon.lbl.Title), route: '../icons' },
			{ id: 'imageLoader', label: this.translate(i18nTextModules.ImageLoader.lbl.Title), route: '../image-loader' },
			{ id: 'input', label: this.translate(i18nTextModules.Input.lbl.Title), route: '../input' },
			{ id: 'languageToggle', label: this.translate(i18nTextModules.LanguageToggle.lbl.Title), route: '../language-toggle' },
			{ id: 'rangeInput', label: this.translate(i18nTextModules.RangeInput.lbl.Title), route: '../range-input' },
			{ id: 'select', label: this.translate(i18nTextModules.Select.lbl.Title), route: '../select' },
			{ id: 'tabs', label: this.translate(i18nTextModules.Tabs.lbl.Title), route: '../tabs' },
			{ id: 'textarea', label: this.translate(i18nTextModules.Textarea.lbl.Title), route: '../textarea' },
			{ id: 'tooltip', label: this.translate(i18nTextModules.Tooltip.lbl.Title), route: '../tooltip' },
			{ id: 'treeView', label: this.translate(i18nTextModules.TreeView.lbl.Title), route: '../tree-view' },
			{ id: 'typography', label: this.translate(i18nTextModules.Typography.lbl.Title), route: '../typography' }
		];
	}

	protected readonly Scopes = Scopes;
	protected readonly i18nTextModules = i18nTextModules;

	private translate(key: string): string {
		return this.translationPipe.transform(key, Scopes.DEMO_FEATURE);
	}
}
