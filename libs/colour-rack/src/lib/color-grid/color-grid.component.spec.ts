/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ColorGridComponent } from './color-grid.component';
import { ColorService } from '../services/color.service';
import { Color } from '../models/color.model';

describe('ColorGridComponent', () => {
	let component: ColorGridComponent;
	let fixture: ComponentFixture<ColorGridComponent>;
	let colorService: jest.Mocked<ColorService>;

	beforeEach(async () => {
		const colorServiceMock = {
			getColors: jest.fn().mockReturnValue(of([])), // Ensure it returns an observable
		};

		await TestBed.configureTestingModule({
			imports: [ColorGridComponent],
			providers: [{ provide: ColorService, useValue: colorServiceMock }],
		}).compileComponents();

		fixture = TestBed.createComponent(ColorGridComponent);
		component = fixture.componentInstance;
		colorService = TestBed.inject(ColorService) as jest.Mocked<ColorService>;
		fixture.detectChanges();
	});

	it('should fetch colors on init', () => {
		const colors: Color[] = [
			{
				name: 'Red',
				alternativeNames: [],
				highlighted: false,
				type: '',
				mainColor: '',
				wave: '',
			},
		];
		colorService.getColors.mockReturnValue(of(colors));

		component.ngOnInit();

		expect(colorService.getColors).toHaveBeenCalled();
		expect(component.colors()).toEqual(colors);
	});

	it('should highlight matching colors', () => {
		const colors: Color[] = [
			{
				name: 'Red',
				alternativeNames: ['Crimson'],
				highlighted: false,
				type: '',
				mainColor: '',
				wave: '',
			},
			{
				name: 'Blue',
				alternativeNames: ['Azure'],
				highlighted: false,
				type: '',
				mainColor: '',
				wave: '',
			},
		];
		component.colors.set(colors);

		component.highlightMatchingColors('red');

		expect(component.colors()[0].highlighted).toBe(true);
		expect(component.colors()[1].highlighted).toBe(false);
	});

	it('should handle empty search query', () => {
		const colors: Color[] = [
			{
				name: 'Red',
				alternativeNames: ['Crimson'],
				highlighted: true,
				type: '',
				mainColor: '',
				wave: '',
			},
			{
				name: 'Blue',
				alternativeNames: ['Azure'],
				highlighted: true,
				type: '',
				mainColor: '',
				wave: '',
			},
		];
		component.colors.set(colors);

		component.highlightMatchingColors('');

		expect(component.colors()[0].highlighted).toBe(false);
		expect(component.colors()[1].highlighted).toBe(false);
	});

	it('should calculate correct storage location', () => {
		const location = component.calculatedStorageLocation(13);
		expect(location).toBe('row 2 col 2');
	});
});
