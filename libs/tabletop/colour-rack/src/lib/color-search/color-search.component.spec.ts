/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSearchComponent } from './color-search.component';
import { setupTestingModule } from '../../test-setup';

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

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit searchEvent with the provided search term', () => {
		const searchTerm = 'blue';
		const searchEventSpy = jest.spyOn(component.searchEvent, 'emit');
		component.onSearchTermChange(searchTerm);
		expect(searchEventSpy).toHaveBeenCalledWith(searchTerm);
	});

	it('should not emit searchEvent when search term is null', () => {
		const searchEventSpy = jest.spyOn(component.searchEvent, 'emit');
		component.onSearchTermChange(null);
		expect(searchEventSpy).not.toHaveBeenCalled();
	});

	it('should not emit searchEvent when search term is undefined', () => {
		const searchEventSpy = jest.spyOn(component.searchEvent, 'emit');
		component.onSearchTermChange(undefined);
		expect(searchEventSpy).not.toHaveBeenCalled();
	});
});
