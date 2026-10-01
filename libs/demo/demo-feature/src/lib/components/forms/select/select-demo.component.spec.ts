/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { SelectDemoComponent } from './select-demo.component';

describe('SelectDemoComponent', () => {
	let fixture: ComponentFixture<SelectDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [SelectDemoComponent]
		});

		fixture = TestBed.createComponent(SelectDemoComponent);
		fixture.detectChanges();
	});

	it('should render single and multiple select examples', () => {
		const selects = fixture.nativeElement.querySelectorAll('theme-select');

		expect(selects).toHaveLength(2);
	});
});
