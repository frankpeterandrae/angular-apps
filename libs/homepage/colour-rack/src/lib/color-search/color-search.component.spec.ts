/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconDefinition, InputComponent } from '@application-platform/shared/ui-theme';
import { vi } from 'vitest';

import { setupTestingModule } from '../../test-setup';

import { ColorSearchComponent } from './color-search.component';

describe('ColorSearchComponent', () => {
	let component: ColorSearchComponent;
	let fixture: ComponentFixture<ColorSearchComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ColorSearchComponent]
		});

		fixture = TestBed.createComponent(ColorSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should emit the entered search term', () => {
		const searchEventSpy = vi.spyOn(component.searchEvent, 'emit');

		const input = fixture.debugElement.query(By.directive(InputComponent)).componentInstance as InputComponent;

		input.valueChange.emit('blue');

		expect(searchEventSpy).toHaveBeenCalledWith('blue');
	});

	it('should emit an empty search term', () => {
		const searchEventSpy = vi.spyOn(component.searchEvent, 'emit');

		const input = fixture.debugElement.query(By.directive(InputComponent)).componentInstance as InputComponent;

		input.valueChange.emit('');

		expect(searchEventSpy).toHaveBeenCalledWith('');
	});

	it('should render the search input with a search icon', () => {
		const input = fixture.debugElement.query(By.directive(InputComponent)).componentInstance as InputComponent;

		expect(input.icon()).toBe(IconDefinition.SEARCH);
	});
});
