/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { CheckboxDemoComponent } from './checkbox-demo.component';

describe('CheckboxDemoComponent', () => {
	let fixture: ComponentFixture<CheckboxDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [CheckboxDemoComponent]
		});

		fixture = TestBed.createComponent(CheckboxDemoComponent);
		fixture.detectChanges();
	});

	it('should render enabled and disabled color variants', () => {
		const groups = fixture.nativeElement.querySelectorAll('theme-checkbox-group');

		expect(groups).toHaveLength(12);
	});
});
