/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxGroupComponent } from './checkbox-group.component';

describe('CheckboxGroupComponent', () => {
	let component: CheckboxGroupComponent;
	let fixture: ComponentFixture<CheckboxGroupComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CheckboxGroupComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(CheckboxGroupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
