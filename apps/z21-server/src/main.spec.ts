/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	providers: {
		cfg: {}
	},
	create: vi.fn(),
	start: vi.fn(),
	stop: vi.fn(),
	providerFactory: vi.fn(),
	bootstrap: vi.fn()
}));

vi.mock('./bootstrap/providers', () => ({
	ProviderFactory: mocks.providerFactory
}));

vi.mock('./bootstrap/bootstrap', () => ({
	Bootstrap: mocks.bootstrap
}));

describe('main', () => {
	let processOnSpy: ReturnType<typeof vi.spyOn>;

	let sigintHandler: (() => void) | undefined;

	let sigtermHandler: (() => void) | undefined;

	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();

		sigintHandler = undefined;
		sigtermHandler = undefined;

		mocks.create.mockReturnValue(mocks.providers);

		mocks.start.mockReturnValue({
			stop: mocks.stop
		});

		mocks.providerFactory.mockImplementation(function () {
			return {
				create: mocks.create
			};
		});

		mocks.bootstrap.mockImplementation(function () {
			return {
				start: mocks.start
			};
		});

		processOnSpy = vi.spyOn(process, 'on').mockImplementation((event, handler) => {
			if (event === 'SIGINT') {
				sigintHandler = handler as () => void;
			}

			if (event === 'SIGTERM') {
				sigtermHandler = handler as () => void;
			}

			return process;
		});
	});

	afterEach(() => {
		processOnSpy.mockRestore();
	});

	it('creates providers and starts the application', async () => {
		await import('./main');

		expect(mocks.providerFactory).toHaveBeenCalledOnce();

		expect(mocks.create).toHaveBeenCalledOnce();

		expect(mocks.bootstrap).toHaveBeenCalledWith(mocks.providers);

		expect(mocks.start).toHaveBeenCalledOnce();
	});

	it('registers shutdown handlers', async () => {
		await import('./main');

		expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));

		expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
	});

	it('stops the application on SIGINT', async () => {
		await import('./main');

		expect(sigintHandler).toBeDefined();

		sigintHandler?.();

		expect(mocks.stop).toHaveBeenCalledOnce();
	});

	it('stops the application on SIGTERM', async () => {
		await import('./main');

		expect(sigtermHandler).toBeDefined();

		sigtermHandler?.();

		expect(mocks.stop).toHaveBeenCalledOnce();
	});
});
