/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, contentChildren, effect } from '@angular/core';

import { CardComponent } from '../../layout/card/card.component';

import { TabComponent } from './tab.component';

/**
 * Manages projected tabs and ensures that only one tab is active.
 */
@Component({
	selector: 'theme-tab-group',
	imports: [CardComponent],
	templateUrl: './tab-group.component.html'
})
export class TabGroupComponent {
	protected readonly tabs = contentChildren(TabComponent);

	private readonly initializeActiveTab = effect(() => {
		const allTabs = this.tabs();

		if (allTabs.length > 0 && !allTabs.some((tab) => tab.active)) {
			this.selectTab(allTabs[0]);
		}
	});

	protected selectTab(tab: TabComponent): void {
		this.tabs().forEach((currentTab) => {
			currentTab.active = false;
		});

		tab.active = true;
	}
}
