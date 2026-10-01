/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { FooterDemoComponent } from './footer-demo.component';

describe('FooterDemoComponent', () => {
	let fixture: ComponentFixture<FooterDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [FooterDemoComponent] });
		fixture = TestBed.createComponent(FooterDemoComponent);
		fixture.detectChanges();
	});

	it('should render the footer example', () => {
		expect(fixture.nativeElement.querySelector('theme-footer')).not.toBeNull();
	});
});
