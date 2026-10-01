/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from '@application-platform/shared/ui-theme';
import { type Mocked, createMock } from '@application-platform/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { setupTestingModule } from '../../test-setup';
import type { Color } from '../models/color.model';
import { ColorService } from '../services/color.service';

import { ColorGridComponent } from './color-grid.component';

class TestColorGridComponent extends ColorGridComponent {
	public openColorDetails(color: Color): void {
		this.openDetails(color);
	}

	public getBackgroundColor(color: Color): string {
		return this.backgroundColor(color);
	}
}

describe('ColorGridComponent', () => {
	let fixture: ComponentFixture<ColorGridComponent>;
	let colorService: Mocked<ColorService>;
	let dialogService: Mocked<DialogService>;

	const colors: Color[] = [
		{
			name: 'Red',
			alternativeNames: ['Crimson'],
			type: 'M',
			mainColor: '#ff0000'
		},
		{
			name: 'Blue',
			alternativeNames: ['Azure'],
			type: 'S',
			mainColor: '#0000ff'
		}
	];

	beforeEach(async () => {
		colorService = createMock<ColorService>({
			getColors: vi.fn().mockReturnValue(of(colors))
		});

		dialogService = createMock<DialogService>({
			open: vi.fn()
		});

		await setupTestingModule({
			imports: [ColorGridComponent],
			providers: [
				{
					provide: ColorService,
					useValue: colorService
				},
				{
					provide: DialogService,
					useValue: dialogService
				}
			]
		});

		fixture = TestBed.createComponent(ColorGridComponent);
		fixture.detectChanges();
	});

	it('should load colors on initialization', () => {
		expect(colorService.getColors).toHaveBeenCalledOnce();
	});

	it('should assign storage positions to loaded colors', () => {
		expect(colors[0].row).toBe(1);
		expect(colors[0].column).toBe(1);

		expect(colors[1].row).toBe(1);
		expect(colors[1].column).toBe(2);
	});

	it('should highlight colors matching their primary name', () => {
		fixture.componentRef.setInput('searchQuery', 'red');
		fixture.detectChanges();

		expect(colors[0].highlighted).toBe(true);
		expect(colors[1].highlighted).toBe(false);
	});

	it('should highlight colors matching an alternative name', () => {
		fixture.componentRef.setInput('searchQuery', 'azure');
		fixture.detectChanges();

		expect(colors[0].highlighted).toBe(false);
		expect(colors[1].highlighted).toBe(true);
	});

	it('should clear highlighting when the search query is empty', () => {
		fixture.componentRef.setInput('searchQuery', 'red');
		fixture.detectChanges();

		fixture.componentRef.setInput('searchQuery', '');
		fixture.detectChanges();

		expect(colors[0].highlighted).toBe(false);
		expect(colors[1].highlighted).toBe(false);
	});

	it('should open color details', () => {
		const testComponent = TestBed.runInInjectionContext(() => new TestColorGridComponent());

		testComponent.openColorDetails(colors[0]);

		expect(dialogService.open).toHaveBeenCalledOnce();
	});

	it('should not reload colors when the window is resized', () => {
		window.dispatchEvent(new Event('resize'));

		expect(colorService.getColors).toHaveBeenCalledOnce();
	});
});
