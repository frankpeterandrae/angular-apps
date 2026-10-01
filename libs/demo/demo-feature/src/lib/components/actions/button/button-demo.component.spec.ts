/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { ButtonDemoComponent } from './button-demo.component';

describe('ButtonDemoComponent', () => {
	let fixture: ComponentFixture<ButtonDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ButtonDemoComponent]
		});

		fixture = TestBed.createComponent(ButtonDemoComponent);
		fixture.detectChanges();
	});

	it('should render button variants', () => {
		const buttons = fixture.nativeElement.querySelectorAll('theme-button');

		expect(buttons.length).toBeGreaterThan(10);
	});
});
