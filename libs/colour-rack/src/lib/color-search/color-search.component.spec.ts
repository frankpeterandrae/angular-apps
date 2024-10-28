/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorSearchComponent } from './color-search.component';

describe('ColorSearchComponent', () => {
	let component: ColorSearchComponent;
	let fixture: ComponentFixture<ColorSearchComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ColorSearchComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ColorSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit searchEvent with searchText when onSearch is called', () => {
		const searchEventSpy = jest.spyOn(component.searchEvent, 'emit');
		component.searchText = 'blue';
		component.onSearch();
		expect(searchEventSpy).toHaveBeenCalledWith('blue');
	});

	it('should emit searchEvent with empty string when searchText is empty', () => {
		const searchEventSpy = jest.spyOn(component.searchEvent, 'emit');
		component.searchText = '';
		component.onSearch();
		expect(searchEventSpy).toHaveBeenCalledWith('');
	});

	it('should not emit searchEvent if searchText is null', () => {
		const searchEventSpy = jest.spyOn(component.searchEvent, 'emit');
		component.searchText = null;
		component.onSearch();
		expect(searchEventSpy).not.toHaveBeenCalled();
	});
});
