/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../test-setup';

import { ColorsComponent } from './colors.component';

describe('ColorsComponent', () => {
	let fixture: ComponentFixture<ColorsComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ColorsComponent]
		});

		fixture = TestBed.createComponent(ColorsComponent);
		fixture.detectChanges();
	});

	it('should render color variation blocks', () => {
		const blocks = fixture.nativeElement.querySelectorAll('.demo-colors-block');

		expect(blocks.length).toBeGreaterThan(0);
	});

	it('should render shade and tint classes', () => {
		const shade = fixture.nativeElement.querySelector('.fpa-bg-light-shades-s1');

		const tint = fixture.nativeElement.querySelector('.fpa-bg-light-shades-t1');

		expect(shade).not.toBeNull();
		expect(tint).not.toBeNull();
	});
});
