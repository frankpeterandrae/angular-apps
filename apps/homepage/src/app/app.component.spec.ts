/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
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

	it('should render the application shell', () => {
		expect(fixture.nativeElement.querySelector('theme-header')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('theme-language-toggle')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('theme-footer')).not.toBeNull();
	});

	it('should provide the homepage navigation routes', () => {
		const menuItems = fixture.componentInstance.menuItems;

		expect(menuItems.find(({ id }) => id === 'home')?.route).toBe('/');
		expect(menuItems.find(({ id }) => id === 'paint-rack')?.route).toBe('/paint-rack');
	});

	it('should expose development navigation only outside production', () => {
		const devItem = fixture.componentInstance.menuItems.find(({ id }) => id === 'dev');

		expect(Boolean(devItem)).toBe(!environment.production);
	});
});
