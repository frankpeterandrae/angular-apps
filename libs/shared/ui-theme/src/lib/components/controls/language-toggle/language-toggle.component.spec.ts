/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ScopedTranslationServiceInterface } from '@application-platform/interfaces';
import type { ScopedTranslationServiceMock } from '@application-platform/testing';

import { setupTestingModule } from '../../../../test-setup';

import { LanguageToggleComponent } from './language-toggle.component';

describe('LanguageToggleComponent', () => {
	let component: LanguageToggleComponent;
	let fixture: ComponentFixture<LanguageToggleComponent>;
	let mockTranslationService: ScopedTranslationServiceMock;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [LanguageToggleComponent]
		});

		fixture = TestBed.createComponent(LanguageToggleComponent);
		component = fixture.componentInstance;
		mockTranslationService = TestBed.inject(ScopedTranslationServiceInterface) as unknown as ScopedTranslationServiceMock;

		fixture.detectChanges();
	});

	it('should toggle the language when the button is clicked', () => {
		const toggleSpy = vi.spyOn(mockTranslationService, 'toggleLanguage');

		const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

		button.click();

		expect(toggleSpy).toHaveBeenCalledOnce();
	});

	it('should announce the target language for the icon-only button', () => {
		const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
		const decorativeIcons = button.querySelectorAll('[aria-hidden="true"]');

		expect(button.getAttribute('aria-label')).toBe('themeI18n.LanguageToggleComponent.lbl.SwitchToGerman');
		expect(decorativeIcons).toHaveLength(2);

		mockTranslationService.currentLang.set('de');
		fixture.detectChanges();

		expect(button.getAttribute('aria-label')).toBe('themeI18n.LanguageToggleComponent.lbl.SwitchToEnglish');
	});
});
