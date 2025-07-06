/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocoCardFormComponent } from './loco-card-form.component';

describe('FrightCarFormComponent', () => {
	let component: LocoCardFormComponent;
	let fixture: ComponentFixture<LocoCardFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [LocoCardFormComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LocoCardFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
