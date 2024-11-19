/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';
import { TranslationPipe } from './translation.pipe';
import { of } from 'rxjs';
import { ScopedTranslationServiceInterface } from '@angular-apps/interfaces';
import { setupTestingModule } from '../../test-setup';

describe('TranslationPipe', () => {
	let pipe: TranslationPipe;
	let translationService: ScopedTranslationServiceInterface;

	beforeEach(async () => {
		const spy = {
			translate: jest.fn(),
		};

		await setupTestingModule({
			providers: [TranslationPipe, { provide: ScopedTranslationServiceInterface, useValue: spy }],
		});

		pipe = TestBed.inject(TranslationPipe);
		translationService = TestBed.inject(ScopedTranslationServiceInterface);
	});

	it('transforms key to translated string', (done) => {
		const key = 'hello';
		const scope = 'common';
		const params = {};
		const translatedValue = 'Hallo';

		(translationService.translate as jest.Mock).mockReturnValue(of(translatedValue));

		pipe.transform(key, scope, params).subscribe((result) => {
			expect(result).toBe(translatedValue);
			done();
		});
	});

	it('transforms key with parameters to translated string', (done) => {
		const key = 'greeting';
		const scope = 'common';
		const params = { name: 'John' };
		const translatedValue = 'Hallo John';

		(translationService.translate as jest.Mock).mockReturnValue(of(translatedValue));

		pipe.transform(key, scope, params).subscribe((result) => {
			expect(result).toBe(translatedValue);
			done();
		});
	});

	it('transforms key with undefined scope to translated string', (done) => {
		const key = 'hello';
		const scope = undefined;
		const params = {};
		const translatedValue = 'Hallo';

		(translationService.translate as jest.Mock).mockReturnValue(of(translatedValue));

		pipe.transform(key, scope, params).subscribe((result) => {
			expect(result).toBe(translatedValue);
			done();
		});
	});

	it('transforms key with null parameters to translated string', (done) => {
		const key = 'hello';
		const scope = 'common';
		const params = undefined;
		const translatedValue = 'Hallo';

		(translationService.translate as jest.Mock).mockReturnValue(of(translatedValue));

		pipe.transform(key, scope, params).subscribe((result) => {
			expect(result).toBe(translatedValue);
			done();
		});
	});
});
