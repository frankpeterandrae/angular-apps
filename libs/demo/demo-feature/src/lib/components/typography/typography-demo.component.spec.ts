/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../test-setup';

import { TypographyDemoComponent } from './typography-demo.component';

describe('TypographyDemoComponent', () => {
	let fixture: ComponentFixture<TypographyDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [TypographyDemoComponent] });
		fixture = TestBed.createComponent(TypographyDemoComponent);
		fixture.detectChanges();
	});

	it('should render all heading levels', () => {
		for (let level = 1; level <= 6; level += 1) {
			expect(fixture.nativeElement.querySelector(`h${level}`)).not.toBeNull();
		}
	});
});
