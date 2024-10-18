/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';

import { NetworkStatusServiceService } from './network-status-service.service';
import { take } from 'rxjs';

describe('NetworkStatusServiceService', () => {
	let service: NetworkStatusServiceService;

	// Utility function to mock navigator.onLine
	const mockNavigatorOnLine = (value: boolean): void => {
		Object.defineProperty(navigator, 'onLine', {
			value,
			configurable: true,
		});
	};

	beforeEach(() => {
		mockNavigatorOnLine(true);

		TestBed.configureTestingModule({
			providers: [NetworkStatusServiceService],
		});
		service = TestBed.inject(NetworkStatusServiceService);
	});

	afterEach(() => {
		// Reset all mocks after each test to avoid interference
		jest.resetAllMocks();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should emit the initial online status', (done) => {
		// Ensure navigator.onLine is true
		mockNavigatorOnLine(true);

		// Re-initialize the service to pick up the updated navigator.onLine value
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			providers: [NetworkStatusServiceService],
		});
		service = TestBed.inject(NetworkStatusServiceService);

		service.status$.pipe(take(1)).subscribe((status) => {
			expect(status).toBe(true);
			done();
		});
	});

	it('should emit the initial offline status', (done) => {
		// Mock navigator.onLine to false
		mockNavigatorOnLine(false);

		// Re-initialize the service to pick up the updated navigator.onLine value
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			providers: [NetworkStatusServiceService],
		});
		service = TestBed.inject(NetworkStatusServiceService);

		service.status$.pipe(take(1)).subscribe((status) => {
			expect(status).toBe(false);
			done();
		});
	});

	it('should emit true when online event is dispatched', (done) => {
		// Initially offline
		mockNavigatorOnLine(false);

		// Re-initialize the service
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			providers: [NetworkStatusServiceService],
		});
		service = TestBed.inject(NetworkStatusServiceService);

		const emittedStatuses: boolean[] = [];

		const subscription = service.status$.subscribe((status) => {
			emittedStatuses.push(status);
			if (emittedStatuses.length === 2) {
				expect(emittedStatuses).toEqual([false, true]);
				subscription.unsubscribe();
				done();
			}
		});

		// Dispatch 'online' event
		window.dispatchEvent(new Event('online'));
	});

	it('should emit false when offline event is dispatched', (done) => {
		// Initially online
		mockNavigatorOnLine(true);

		// Re-initialize the service
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			providers: [NetworkStatusServiceService],
		});
		service = TestBed.inject(NetworkStatusServiceService);

		const emittedStatuses: boolean[] = [];

		const subscription = service.status$.subscribe((status) => {
			emittedStatuses.push(status);
			if (emittedStatuses.length === 2) {
				expect(emittedStatuses).toEqual([true, false]);
				subscription.unsubscribe();
				done();
			}
		});

		// Dispatch 'offline' event
		window.dispatchEvent(new Event('offline'));
	});

	it('should handle multiple online and offline events correctly', (done) => {
		// Initially offline
		mockNavigatorOnLine(false);

		// Re-initialize the service
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			providers: [NetworkStatusServiceService],
		});
		service = TestBed.inject(NetworkStatusServiceService);

		const expectedStatuses = [false, true, false, true];
		const receivedStatuses: boolean[] = [];

		const subscription = service.status$.subscribe((status) => {
			receivedStatuses.push(status);
			if (receivedStatuses.length === expectedStatuses.length) {
				expect(receivedStatuses).toEqual(expectedStatuses);
				subscription.unsubscribe();
				done();
			}
		});

		// Dispatch events in sequence
		window.dispatchEvent(new Event('online'));
		window.dispatchEvent(new Event('offline'));
		window.dispatchEvent(new Event('online'));
	});
});
