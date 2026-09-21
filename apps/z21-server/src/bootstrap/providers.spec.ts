/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CommandStationInfo, LocoManager } from '@application-platform/domain';
import { DeepMock } from '@application-platform/shared-node-test';
import { Z21CommandService, Z21Udp } from '@application-platform/z21';
import type { ServerConfig } from '@application-platform/z21-shared';
import { describe, expect, it } from 'vitest';

import { Z21EventHandler } from '../handler/z21-event-handler';
import type { ServerConfigLoader } from '../infra/config/server-config-loader';
import { AppWsServer } from '../infra/ws/app-websocket-server';
import { CommandStationInfoOrchestrator } from '../services/command-station-info-orchestrator';
import { CvProgrammingService } from '../services/cv-programming-service';

import { ProviderFactory } from './providers';

describe('createProviders', () => {
	const cfg: ServerConfig = {
		httpPort: 6060,
		z21: {
			host: '2.3.4.5',
			udpPort: 21106,
			listenPort: 30000
		},
		safety: {
			stopAllOnClientDisconnect: true
		}
	};

	it('uses the supplied configuration', () => {
		const providers = new ProviderFactory().create(cfg);

		expect(providers.cfg).toBe(cfg);
		expect(providers.cfg.z21.host).toBe('2.3.4.5');
		expect(providers.cfg.z21.udpPort).toBe(21106);
		expect(providers.cfg.z21.listenPort).toBe(30000);
	});

	it('creates the application provider graph', () => {
		const providers = new ProviderFactory().create(cfg);

		expect(providers.udp).toBeInstanceOf(Z21Udp);
		expect(providers.wsServer).toBeInstanceOf(AppWsServer);
		expect(providers.z21CommandService).toBeInstanceOf(Z21CommandService);
		expect(providers.commandStationInfo).toBeInstanceOf(CommandStationInfo);
		expect(providers.csInfoOrchestrator).toBeInstanceOf(CommandStationInfoOrchestrator);
		expect(providers.cvProgrammingService).toBeInstanceOf(CvProgrammingService);
		expect(providers.locoManager).toBeInstanceOf(LocoManager);
		expect(providers.z21EventHandler).toBeInstanceOf(Z21EventHandler);
	});

	it('creates the HTTP and logging infrastructure', () => {
		const providers = new ProviderFactory().create(cfg);

		expect(providers.httpServer).toBeDefined();
		expect(providers.httpServer.listening).toBe(false);

		expect(providers.logger).toBeDefined();
	});

	it('loads configuration when no override is supplied', () => {
		const configLoader = DeepMock<ServerConfigLoader>();

		configLoader.load.mockReturnValue(cfg);

		const providers = new ProviderFactory(configLoader).create();

		expect(configLoader.load).toHaveBeenCalledOnce();

		expect(providers.cfg).toBe(cfg);
	});

	it('does not load configuration when an override is supplied', () => {
		const configLoader = DeepMock<ServerConfigLoader>();

		const providers = new ProviderFactory(configLoader).create(cfg);

		expect(configLoader.load).not.toHaveBeenCalled();

		expect(providers.cfg).toBe(cfg);
	});
});
