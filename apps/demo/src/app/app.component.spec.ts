/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { DropdownSelectComponent } from '@application-platform/shared/ui-theme';
import { afterEach } from 'vitest';

import { setupTestingModule } from '../test-setup';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [AppComponent],
			providers: [provideRouter([])]
		});

		fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
	});

	afterEach(() => {
		document.getElementById('homepage-theme')?.remove();
	});

	it('should render the application shell', () => {
		expect(fixture.nativeElement.querySelector('theme-header')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('theme-footer')).not.toBeNull();
	});

	it('should ignore an empty theme selection', () => {
		const dropdown = fixture.debugElement.query(By.directive(DropdownSelectComponent)).componentInstance;
		const stylesheet = document.getElementById('homepage-theme') as HTMLLinkElement;

		dropdown.selectionChange.emit(null);
		fixture.detectChanges();

		expect(stylesheet.getAttribute('href')).toBe('homepage-theme.css');
	});

	it('should switch the theme stylesheet from the dropdown', () => {
		const dropdown = fixture.debugElement.query(By.directive(DropdownSelectComponent)).componentInstance;

		dropdown.selectionChange.emit('z21');
		fixture.detectChanges();

		const stylesheet = document.getElementById('homepage-theme') as HTMLLinkElement | null;
		expect(stylesheet?.getAttribute('href')).toBe('z21-theme.css');
	});

	it('should reuse the existing theme stylesheet', () => {
		const dropdown = fixture.debugElement.query(By.directive(DropdownSelectComponent)).componentInstance;

		dropdown.selectionChange.emit('z21');
		dropdown.selectionChange.emit('homepage');

		expect(document.querySelectorAll('#homepage-theme')).toHaveLength(1);
		expect((document.getElementById('homepage-theme') as HTMLLinkElement).getAttribute('href')).toBe('homepage-theme.css');
	});
});
