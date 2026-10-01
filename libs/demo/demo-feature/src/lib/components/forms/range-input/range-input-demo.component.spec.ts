/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { RangeInputDemoComponent } from './range-input-demo.component';

describe('RangeInputDemoComponent', () => {
	let fixture: ComponentFixture<RangeInputDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [RangeInputDemoComponent]
		});

		fixture = TestBed.createComponent(RangeInputDemoComponent);
		fixture.detectChanges();
	});

	it('should render the range input with its initial values', () => {
		const rangeInput = fixture.nativeElement.querySelector('theme-range-input');
		const text = fixture.nativeElement.textContent;

		expect(rangeInput).not.toBeNull();
		expect(text).toContain('From: 100');
		expect(text).toContain('To: 1000');
	});
});
