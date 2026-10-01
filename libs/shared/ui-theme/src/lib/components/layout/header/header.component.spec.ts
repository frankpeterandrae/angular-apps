/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { setupTestingModule } from '../../../../test-setup';
import { TopNavbarComponent } from '../../navigation/top-navbar/top-navbar.component';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
	let component: HeaderComponent;
	let fixture: ComponentFixture<HeaderComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [HeaderComponent],
			providers: [provideRouter([])]
		});

		fixture = TestBed.createComponent(HeaderComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('menuItems', []);
		fixture.detectChanges();
	});

	it('should render the top navbar', () => {
		expect(fixture.nativeElement.querySelector('theme-topnavbar')).not.toBeNull();
	});

	it('should pass menu items to the top navbar', () => {
		const menuItems = [
			{
				id: 'home',
				label: 'Home',
				route: '/home'
			}
		];

		fixture.componentRef.setInput('menuItems', menuItems);
		fixture.detectChanges();

		const navbar = fixture.debugElement.query(By.directive(TopNavbarComponent)).componentInstance as TopNavbarComponent;

		expect(navbar.menuItems()).toEqual(menuItems);
	});
});
