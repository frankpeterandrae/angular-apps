/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ColorService } from './color.service';
import { Color } from '../models/color.model';
import { provideHttpClient } from '@angular/common/http';

describe('ColorService', () => {
	let service: ColorService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ColorService, provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(ColorService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should fetch colors successfully', () => {
		const mockColors: Color[] = [
			{
				name: 'Red',
				alternativeNames: [],
				highlighted: false,
				type: '',
				mainColor: '',
				wave: '',
			},
			{
				name: 'Blue',
				alternativeNames: [],
				highlighted: false,
				type: '',
				mainColor: '',
				wave: '',
			},
		];

		service.getColors().subscribe((colors) => {
			expect(colors).toEqual(mockColors);
		});

		const req = httpMock.expectOne('assets/colors.json');
		expect(req.request.method).toBe('GET');
		req.flush(mockColors);
	});

	it('should handle empty color list', () => {
		const mockColors: Color[] = [];

		service.getColors().subscribe((colors) => {
			expect(colors).toEqual(mockColors);
		});

		const req = httpMock.expectOne('assets/colors.json');
		expect(req.request.method).toBe('GET');
		req.flush(mockColors);
	});

	it('should handle HTTP error', () => {
		const errorMessage = '404 error';

		service.getColors().subscribe(
			() => fail('expected an error, not colors'),
			(error) => expect(error.status).toBe(404),
		);

		const req = httpMock.expectOne('assets/colors.json');
		req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
	});
});
