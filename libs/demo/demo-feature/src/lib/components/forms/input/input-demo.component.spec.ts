/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { InputDemoComponent } from './input-demo.component';

describe('InputDemoComponent', () => {
	let fixture: ComponentFixture<InputDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [InputDemoComponent]
		});

		fixture = TestBed.createComponent(InputDemoComponent);
		fixture.detectChanges();
	});

	it('should render the input examples', () => {
		const inputs = fixture.nativeElement.querySelectorAll('theme-input');

		expect(inputs).toHaveLength(5);
	});
});
