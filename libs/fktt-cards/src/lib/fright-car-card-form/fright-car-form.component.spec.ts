/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrightCarFormComponent } from './fright-car-form.component';

describe('FrightCarFormComponent', () => {
	let component: FrightCarFormComponent;
	let fixture: ComponentFixture<FrightCarFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FrightCarFormComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(FrightCarFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
