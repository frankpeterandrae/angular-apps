/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { type Mocked, createMock } from '@application-platform/testing';
import { vi } from 'vitest';

import { setupTestingModule } from '../../../test-setup';

import { Error404Component } from './error404.component';

describe('Error404Component', () => {
	let fixture: ComponentFixture<Error404Component>;
	let router: Mocked<Router>;

	beforeEach(async () => {
		router = createMock<Router>({
			navigate: vi.fn().mockResolvedValue(true)
		});

		await setupTestingModule({
			imports: [Error404Component],
			providers: [
				{
					provide: Router,
					useValue: router
				}
			]
		});

		fixture = TestBed.createComponent(Error404Component);
		fixture.detectChanges();
	});

	it('should navigate to the home page', async () => {
		const button = fixture.nativeElement.querySelector('theme-button') as HTMLElement;

		button.dispatchEvent(new CustomEvent('buttonClick'));

		await fixture.whenStable();

		expect(router.navigate).toHaveBeenCalledWith(['/']);
	});
});
