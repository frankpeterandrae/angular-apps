/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSearchComponent } from './color-search.component';

describe('ColorSearchComponent', () => {
	let component: ColorSearchComponent;
	let fixture: ComponentFixture<ColorSearchComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ColorSearchComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ColorSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
