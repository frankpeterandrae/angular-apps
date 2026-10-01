/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { LanguageToggleDemoComponent } from './language-toggle-demo.component';

describe('LanguageToggleDemoComponent', () => {
	let fixture: ComponentFixture<LanguageToggleDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [LanguageToggleDemoComponent] });
		fixture = TestBed.createComponent(LanguageToggleDemoComponent);
		fixture.detectChanges();
	});

	it('should render the language toggle example', () => {
		expect(fixture.nativeElement.querySelector('theme-language-toggle')).not.toBeNull();
	});
});
