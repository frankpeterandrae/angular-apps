/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DropdownSelectComponent } from '@application-platform/shared/ui-theme';

import { setupTestingModule } from '../../../../test-setup';

import { DropdownDemoComponent } from './dropdown-demo.component';

describe('DropdownDemoComponent', () => {
	let fixture: ComponentFixture<DropdownDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [DropdownDemoComponent]
		});

		fixture = TestBed.createComponent(DropdownDemoComponent);
		fixture.detectChanges();
	});

	it('should render the dropdown examples', () => {
		const dropdowns = fixture.nativeElement.querySelectorAll('theme-dropdown-select');

		expect(dropdowns).toHaveLength(3);
	});

	it('should display the selected person', () => {
		const dropdowns = fixture.debugElement.queryAll(By.directive(DropdownSelectComponent));
		const personDropdown = dropdowns[0].componentInstance;

		personDropdown.selectionChange.emit({
			id: 1,
			name: 'Alice'
		});

		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('Selected: Alice');
	});
});
