/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorGridComponent } from './color-grid.component';

describe('ColorGridComponent', () => {
	let component: ColorGridComponent;
	let fixture: ComponentFixture<ColorGridComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ColorGridComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ColorGridComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
