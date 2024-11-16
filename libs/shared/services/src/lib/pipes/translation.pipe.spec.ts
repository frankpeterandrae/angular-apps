/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';
import { TranslationPipe } from './translation.pipe';
import { ScopedTranslationService } from '../services/translation/scoped-tranlation.service';
import { of } from 'rxjs';

describe('TranslationPipe', () => {
	let pipe: TranslationPipe;
	let translationService: ScopedTranslationService;

	beforeEach(() => {
		const spy = {
			translate: jest.fn(),
		};

		TestBed.configureTestingModule({
			providers: [TranslationPipe, { provide: ScopedTranslationService, useValue: spy }],
		});

		pipe = TestBed.inject(TranslationPipe);
		translationService = TestBed.inject(ScopedTranslationService);
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
