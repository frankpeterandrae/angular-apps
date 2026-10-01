/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { HeaderDemoComponent } from './header-demo.component';

describe('HeaderDemoComponent', () => {
	let fixture: ComponentFixture<HeaderDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [HeaderDemoComponent] });
		fixture = TestBed.createComponent(HeaderDemoComponent);
		fixture.detectChanges();
	});

	it('should render the header example', () => {
		expect(fixture.nativeElement.querySelector('theme-header')).not.toBeNull();
	});
});
