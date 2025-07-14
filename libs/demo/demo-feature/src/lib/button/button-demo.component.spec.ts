/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonDemoComponent } from './button-demo.component';
import { setupTestingModule } from '../../test-setup';

describe('ButtonComponent', () => {
	let component: ButtonDemoComponent;
	let fixture: ComponentFixture<ButtonDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ButtonDemoComponent]
		});

		fixture = TestBed.createComponent(ButtonDemoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
