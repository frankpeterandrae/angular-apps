/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ServerConfigLoader } from './server-config-loader';

vi.mock('node:fs');
vi.mock('node:path');

describe('loadConfig', () => {
	let loader: ServerConfigLoader;

	const originalEnv = {
		...process.env
	};

	beforeEach(() => {
		process.env = {
			...originalEnv
		};

		loader = new ServerConfigLoader();

		vi.mocked(path.resolve).mockImplementation((...parts: string[]) => parts.join('/'));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('returns defaults when the config file cannot be read', () => {
		vi.mocked(fs.readFileSync).mockImplementation(() => {
			throw new Error('ENOENT');
		});

		expect(loader.load()).toEqual({
			httpPort: 8080,
			z21: {
				host: '192.168.0.111',
				udpPort: 21105
			},
			safety: {
				stopAllOnClientDisconnect: true
			}
		});
	});

	it('returns defaults when the config file contains invalid JSON', () => {
		vi.mocked(fs.readFileSync).mockReturnValue('{invalid');

		expect(loader.load()).toEqual({
			httpPort: 8080,
			z21: {
				host: '192.168.0.111',
				udpPort: 21105
			},
			safety: {
				stopAllOnClientDisconnect: true
			}
		});
	});

	it('uses the path from Z21_CONFIG when configured', () => {
		process.env['Z21_CONFIG'] = 'custom/config.json';

		vi.mocked(fs.readFileSync).mockReturnValue('{}');

		loader.load();

		expect(path.resolve).toHaveBeenCalledWith('custom/config.json');

		expect(fs.readFileSync).toHaveBeenCalledWith('custom/config.json', 'utf-8');
	});

	it('uses config.json from the current working directory by default', () => {
		delete process.env['Z21_CONFIG'];

		vi.mocked(fs.readFileSync).mockReturnValue('{}');

		loader.load();

		expect(path.resolve).toHaveBeenCalledWith(process.cwd(), 'config.json');
	});

	it('merges top-level and nested configuration with defaults', () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			JSON.stringify({
				httpPort: 9090,
				z21: {
					host: '10.0.0.5',
					listenPort: 30000,
					debug: true
				},
				safety: {
					stopAllOnClientDisconnect: false
				}
			})
		);

		expect(loader.load()).toEqual({
			httpPort: 9090,
			z21: {
				host: '10.0.0.5',
				udpPort: 21105,
				listenPort: 30000,
				debug: true
			},
			safety: {
				stopAllOnClientDisconnect: false
			}
		});
	});

	it('preserves development configuration', () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			JSON.stringify({
				dev: {
					logLevel: 'debug',
					pretty: false,
					subscribeLocoAddr: 50
				}
			})
		);

		expect(loader.load().dev).toEqual({
			logLevel: 'debug',
			pretty: false,
			subscribeLocoAddr: 50
		});
	});

	it('ignores invalid top-level configuration values', () => {
		vi.mocked(fs.readFileSync).mockReturnValue(
			JSON.stringify({
				httpPort: 'invalid',
				z21: null,
				safety: []
			})
		);

		expect(loader.load()).toEqual({
			httpPort: 8080,
			z21: {
				host: '192.168.0.111',
				udpPort: 21105
			},
			safety: {
				stopAllOnClientDisconnect: true
			}
		});
	});
});
