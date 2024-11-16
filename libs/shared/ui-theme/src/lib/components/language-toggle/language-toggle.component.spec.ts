/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageToggleComponent } from './language-toggle.component';
import { setupTestingModule } from '../../../test-setup';
import { ScopedTranslationService } from '@angular-apps/services';
import { delay, Observable, of } from 'rxjs';
import { signal } from '@angular/core';

/**
 * Mock service for ScopedTranslationService.
 */
class MockScopedTranslationService {
	/**
	 * Mocked translate function.
	 * @param {string} key - The key to be translated.
	 * @param {string} [scope] - The optional scope for the translation.
	 * @param {Record<string, string>} [params] - The optional parameters for the translation.
	 * @returns {Observable<string>} An observable that emits the translated string.
	 */
	public translate = (key: string, scope?: string, params: Record<string, string> = {}): Observable<string> =>
		of(key).pipe(delay(100)); // Add a short delay

	public currentLang = signal('en'); // Mock `currentLang` as a signal
	public toggleLanguage = jest.fn(); // Mock toggleLanguage method
}
describe('LanguageToggleComponent', () => {
	let component: LanguageToggleComponent;
	let fixture: ComponentFixture<LanguageToggleComponent>;
	let mockTranslationService: MockScopedTranslationService;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [LanguageToggleComponent],
			providers: [
				{
					provide: ScopedTranslationService,
					useClass: MockScopedTranslationService,
				},
			],
		});

		fixture = TestBed.createComponent(LanguageToggleComponent);
		component = fixture.componentInstance;
		mockTranslationService = TestBed.inject(ScopedTranslationService) as unknown as MockScopedTranslationService;

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize language property correctly', () => {
		expect(component.language).toBe(mockTranslationService.currentLang);
	});

	it('should call toggleLanguage on service when toggleLanguage is called', () => {
		component.toggleLanguage();
		expect(mockTranslationService.toggleLanguage).toHaveBeenCalled();
	});
});
