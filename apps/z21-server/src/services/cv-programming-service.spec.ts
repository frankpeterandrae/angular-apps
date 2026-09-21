/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import type { Z21CommandService } from '@application-platform/z21';
import { Z21EventName, type Z21Event } from '@application-platform/z21-shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CvProgrammingService } from './cv-programming-service';

describe('CvProgrammingService', () => {
	let service: CvProgrammingService;
	let z21CommandService: DeepMocked<Z21CommandService>;

	const cvResult = (cv: number, value: number): Z21Event => ({
		event: Z21EventName.CV_RESULT,
		payload: {
			cv,
			value,
			raw: []
		}
	});

	const cvNack = (shortCircuit = false): Z21Event => ({
		event: Z21EventName.CV_NACK,
		payload: {
			shortCircuit,
			raw: []
		}
	});

	beforeEach(() => {
		vi.useFakeTimers();

		z21CommandService = DeepMock<Z21CommandService>();

		service = new CvProgrammingService(z21CommandService, 1000);
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	describe('readCv', () => {
		it('sends a read command and resolves with the matching result', async () => {
			const promise = service.readCv(29);

			expect(z21CommandService.sendCvRead).toHaveBeenCalledWith(29);

			service.onEvent(cvResult(29, 42));

			await expect(promise).resolves.toEqual({
				cvAddress: 29,
				cvValue: 42
			});
		});

		it('ignores results for another CV address', async () => {
			const promise = service.readCv(29);

			service.onEvent(cvResult(17, 1));

			service.onEvent(cvResult(29, 42));

			await expect(promise).resolves.toEqual({
				cvAddress: 29,
				cvValue: 42
			});
		});

		it('rejects when the operation times out', async () => {
			const promise = service.readCv(29);

			vi.advanceTimersByTime(1000);

			await expect(promise).rejects.toThrow('CV programming operation timed out');
		});

		it('rejects when the command station sends a NACK', async () => {
			const promise = service.readCv(29);

			service.onEvent(cvNack());

			await expect(promise).rejects.toThrow('CV programming NACK received');
		});

		it('rejects with a specific error for programming-track short circuits', async () => {
			const promise = service.readCv(29);

			service.onEvent(cvNack(true));

			await expect(promise).rejects.toThrow('CV programming short circuit detected');
		});
	});

	describe('writeCv', () => {
		it('sends a write command and resolves after the matching result', async () => {
			const promise = service.writeCv(29, 14);

			expect(z21CommandService.sendCvWrite).toHaveBeenCalledWith(29, 14);

			service.onEvent(cvResult(29, 14));

			await expect(promise).resolves.toBeUndefined();
		});
	});

	describe('queue', () => {
		it('runs only one CV operation at a time', () => {
			void service.readCv(1);
			void service.readCv(17);
			void service.readCv(29);

			expect(z21CommandService.sendCvRead).toHaveBeenCalledOnce();

			expect(z21CommandService.sendCvRead).toHaveBeenCalledWith(1);
		});

		it('starts the next queued operation after a successful result', async () => {
			const first = service.readCv(1);

			const second = service.readCv(17);

			service.onEvent(cvResult(1, 3));

			await first;

			expect(z21CommandService.sendCvRead).toHaveBeenCalledTimes(2);

			expect(z21CommandService.sendCvRead).toHaveBeenLastCalledWith(17);

			service.onEvent(cvResult(17, 192));

			await expect(second).resolves.toEqual({
				cvAddress: 17,
				cvValue: 192
			});
		});

		it('starts the next queued operation after a NACK', async () => {
			const first = service.readCv(1);

			const second = service.readCv(17);

			service.onEvent(cvNack());

			await expect(first).rejects.toThrow('CV programming NACK received');

			expect(z21CommandService.sendCvRead).toHaveBeenLastCalledWith(17);

			service.onEvent(cvResult(17, 192));

			await expect(second).resolves.toEqual({
				cvAddress: 17,
				cvValue: 192
			});
		});

		it('starts the next queued operation after a timeout', async () => {
			const first = service.readCv(1);

			const second = service.readCv(17);

			vi.advanceTimersByTime(1000);

			await expect(first).rejects.toThrow('CV programming operation timed out');

			expect(z21CommandService.sendCvRead).toHaveBeenLastCalledWith(17);

			service.onEvent(cvResult(17, 192));

			await expect(second).resolves.toEqual({
				cvAddress: 17,
				cvValue: 192
			});
		});

		it('preserves queue order across reads and writes', async () => {
			const read = service.readCv(1);

			const write = service.writeCv(8, 7);

			expect(z21CommandService.sendCvRead).toHaveBeenCalledWith(1);

			expect(z21CommandService.sendCvWrite).not.toHaveBeenCalled();

			service.onEvent(cvResult(1, 3));

			await read;

			expect(z21CommandService.sendCvWrite).toHaveBeenCalledWith(8, 7);

			service.onEvent(cvResult(8, 7));

			await expect(write).resolves.toBeUndefined();
		});
	});

	describe('events', () => {
		it('ignores events when no operation is active', () => {
			expect(() => {
				service.onEvent(cvResult(29, 42));
			}).not.toThrow();
		});

		it('ignores unrelated Z21 events while an operation is active', async () => {
			const promise = service.readCv(29);

			service.onEvent({
				event: Z21EventName.TRACK_POWER,
				payload: {
					powerOn: true,
					emergencyStop: false,
					shortCircuit: false,
					programmingMode: false,
					raw: []
				}
			});

			service.onEvent(cvResult(29, 42));

			await expect(promise).resolves.toEqual({
				cvAddress: 29,
				cvValue: 42
			});
		});

		it('ignores late events after an operation has completed', async () => {
			const promise = service.readCv(29);

			service.onEvent(cvResult(29, 42));

			await promise;

			expect(() => {
				service.onEvent(cvNack());
			}).not.toThrow();
		});
	});

	it('uses the configured timeout', async () => {
		const customService = new CvProgrammingService(z21CommandService, 2000);

		const promise = customService.readCv(29);

		vi.advanceTimersByTime(1999);

		expect(z21CommandService.sendCvRead).toHaveBeenCalledWith(29);

		vi.advanceTimersByTime(1);

		await expect(promise).rejects.toThrow('CV programming operation timed out');
	});
});
