/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { setupTestingModule } from '../test-setup';

describe('AppComponent', () => {
	beforeEach(async () => {
		await setupTestingModule({
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
		});
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it('should have the correct title', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app.title).toEqual('demo');
	});
});
