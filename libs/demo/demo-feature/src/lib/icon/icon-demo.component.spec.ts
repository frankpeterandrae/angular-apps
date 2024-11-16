/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconDemoComponent } from './icon-demo.component';
import { setupTestingModule } from '../../test-setup';

describe('IconComponent', () => {
	let component: IconDemoComponent;
	let fixture: ComponentFixture<IconDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [IconDemoComponent],
		});

		fixture = TestBed.createComponent(IconDemoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
