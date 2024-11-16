/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypographyDemoComponent } from './typography-demo.component';
import { setupTestingModule } from '../../test-setup';

describe('TypographyComponent', () => {
	let component: TypographyDemoComponent;
	let fixture: ComponentFixture<TypographyDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [TypographyDemoComponent],
		});

		fixture = TestBed.createComponent(TypographyDemoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
