/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ColorSearchContainerComponent } from './color-search-container.component';
import { ColorGridComponent } from '../color-grid/color-grid.component';
import { ColorSearchComponent } from '../color-search/color-search.component';
import { provideHttpClient } from '@angular/common/http';
import { setupTestingModule } from '../../test-setup';

describe('ColorSearchContainerComponent', () => {
	let component: ColorSearchContainerComponent;
	let fixture: ComponentFixture<ColorSearchContainerComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ColorSearchContainerComponent, ColorSearchComponent, ColorGridComponent],
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		fixture = TestBed.createComponent(ColorSearchContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should update search query', () => {
		const newQuery = 'blue';
		component.updateSearchQuery(newQuery);
		expect(component.searchQuery()).toBe(newQuery);
	});

	it('should initialize search query as empty string', () => {
		expect(component.searchQuery()).toBe('');
	});

	it('should handle empty search query update', () => {
		component.updateSearchQuery('');
		expect(component.searchQuery()).toBe('');
	});
});
