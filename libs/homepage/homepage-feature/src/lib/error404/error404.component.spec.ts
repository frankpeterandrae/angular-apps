/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Error404Component } from './error404.component';
import { setupTestingModule } from '../../test-setup';

describe('Error404Component', () => {
	let component: Error404Component;
	let fixture: ComponentFixture<Error404Component>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [Error404Component],
		});

		fixture = TestBed.createComponent(Error404Component);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should navigate to home on routeToHome call', () => {
		const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(() => Promise.resolve(true));
		component.routeToHome();
		expect(navigateSpy).toHaveBeenCalledWith(['/']);
	});

	it('should log error if navigation to home fails', async () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const navigateSpy = jest
			.spyOn(component['router'], 'navigate')
			.mockImplementation(() => Promise.reject('Navigation Error'));
		await component.routeToHome();
		expect(navigateSpy).toHaveBeenCalledWith(['/']);
		expect(consoleErrorSpy).toHaveBeenCalledWith('Navigation Error');
	});
});
