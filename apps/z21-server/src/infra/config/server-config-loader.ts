/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';

import type { ServerConfig } from '@application-platform/z21-shared';

type ConfigOverrides = Partial<Omit<ServerConfig, 'z21' | 'safety'>> & {
	z21?: Partial<ServerConfig['z21']>;
	safety?: Partial<ServerConfig['safety']>;
};

const DEFAULT_CONFIG: ServerConfig = {
	httpPort: 8080,
	z21: {
		host: '192.168.0.111',
		udpPort: 21105
	},
	safety: {
		stopAllOnClientDisconnect: true
	}
};

/**
 * Loads and merges the Z21 server configuration.
 */
export class ServerConfigLoader {
	/**
	 * Loads the server configuration from disk.
	 *
	 * Falls back to the default configuration when the file cannot be read
	 * or parsed.
	 *
	 * @returns Effective server configuration.
	 */
	public load(): ServerConfig {
		const configPath = this.resolveConfigPath();

		try {
			const raw = fs.readFileSync(configPath, 'utf-8');

			const parsed: unknown = JSON.parse(raw);

			const overrides = this.toConfigOverrides(parsed);

			return this.mergeConfig(overrides);
		} catch {
			return DEFAULT_CONFIG;
		}
	}

	private resolveConfigPath(): string {
		const configuredPath = process.env['Z21_CONFIG'];

		return configuredPath ? path.resolve(configuredPath) : path.resolve(process.cwd(), 'config.json');
	}

	private mergeConfig(overrides: ConfigOverrides): ServerConfig {
		return {
			...DEFAULT_CONFIG,
			...overrides,
			z21: {
				...DEFAULT_CONFIG.z21,
				...overrides.z21
			},
			safety: {
				...DEFAULT_CONFIG.safety,
				...overrides.safety
			}
		};
	}

	private toConfigOverrides(value: unknown): ConfigOverrides {
		if (!this.isRecord(value)) {
			return {};
		}

		return {
			...(typeof value['httpPort'] === 'number'
				? {
						httpPort: value['httpPort']
					}
				: {}),
			...(this.isRecord(value['z21'])
				? {
						z21: value['z21'] as Partial<ServerConfig['z21']>
					}
				: {}),
			...(this.isRecord(value['safety'])
				? {
						safety: value['safety'] as Partial<ServerConfig['safety']>
					}
				: {}),
			...(this.isRecord(value['dev'])
				? {
						dev: value['dev'] as ServerConfig['dev']
					}
				: {})
		};
	}

	private isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}
}
