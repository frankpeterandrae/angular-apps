/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { TabsDemoComponent } from './tabs-demo.component';

describe('TabsDemoComponent', () => {
	let fixture: ComponentFixture<TabsDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [TabsDemoComponent] });
		fixture = TestBed.createComponent(TabsDemoComponent);
		fixture.detectChanges();
	});

	it('should render the tab examples', () => {
		expect(fixture.nativeElement.querySelectorAll('theme-tab')).toHaveLength(4);
	});
});
