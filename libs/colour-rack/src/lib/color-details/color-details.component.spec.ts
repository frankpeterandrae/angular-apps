/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorDetailsComponent } from './color-details.component';
import { DIALOG_DATA, DialogConfigModel } from '@angular-apps/shared/ui-theme';
import { OverlayRef } from '@angular/cdk/overlay';
import { Color } from '../models/color.model';

describe('ColorDetailsComponent', () => {
	let component: ColorDetailsComponent;
	let fixture: ComponentFixture<ColorDetailsComponent>;
	let overlayRefMock: jest.Mocked<OverlayRef>;

	beforeEach(async () => {
		overlayRefMock = {
			dispose: jest.fn(),
		} as unknown as jest.Mocked<OverlayRef>;

		const mockDialogData: DialogConfigModel<any> = {
			componentData: undefined,
			settings: { title: 'Test Dialog' },
		};

		await TestBed.configureTestingModule({
			imports: [ColorDetailsComponent],
			providers: [
				{ provide: OverlayRef, useValue: overlayRefMock },
				{ provide: DIALOG_DATA, useValue: mockDialogData },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ColorDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return correct color type when valid types are provided', () => {
		component.data.componentData = { type: 'S' } as Color;
		expect(component.colorType()).toBe('Shadow');
	});

	it('should return correct color type when valid combined types are provided', () => {
		component.data.componentData = { type: 'S-ME' } as Color;
		expect(component.colorType()).toBe('Shadow-Metallic');
	});

	it('should return "Unknown" when invalid types are provided', () => {
		component.data.componentData = { type: 'Metallic' } as Color;
		expect(component.colorType()).toBe('Unknown');
	});

	it('should return "Unknown" when type is undefined', () => {
		component.data.componentData = { type: undefined } as Color;
		expect(component.colorType()).toBe('Unknown');
	});
});
