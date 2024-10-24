/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconDemoComponent } from './icon-demo.component';

describe('IconComponent', () => {
	let component: IconDemoComponent;
	let fixture: ComponentFixture<IconDemoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [IconDemoComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(IconDemoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
