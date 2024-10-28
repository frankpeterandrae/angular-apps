/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { environment } from '@angular-apps/config';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AppComponent],
			providers: [
				{
					provide: ActivatedRoute,
					useValue: {
						params: of({}),
						snapshot: {
							paramMap: {
								/**
								 * Mocked get.
								 * @returns Null.
								 */
								get: (): any => null,
							},
						},
					},
				},
			],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it('should have the correct title', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app.title).toEqual('homepage');
	});

	it('should have menu items defined', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app.menuItems).toBeDefined();
	});

	it('should have correct menu items in development mode', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		if (!environment.production) {
			expect(app.menuItems.some((item) => item.label === 'In Entwicklung')).toBe(true);
		}
	});

	it('should not have development menu items in production mode', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		if (environment.production) {
			expect(app.menuItems.some((item) => item.label === 'In Entwicklung')).toBe(false);
		}
	});
});
