/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../test-setup';

import { IconDemoComponent } from './icon-demo.component';

describe('IconDemoComponent', () => {
	let fixture: ComponentFixture<IconDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [IconDemoComponent]
		});

		fixture = TestBed.createComponent(IconDemoComponent);
		fixture.detectChanges();
	});

	it('should render available icons', () => {
		const icons = fixture.nativeElement.querySelectorAll('fast-svg');

		expect(icons.length).toBeGreaterThan(0);
	});
});
