/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type http from 'node:http';

import type { CommandStationInfo, LocoManager } from '@application-platform/domain';
import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import { Z21BroadcastFlag, type Z21CommandService, type Z21Udp } from '@application-platform/z21';
import type { Logger, ServerConfig } from '@application-platform/z21-shared';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import type { Z21EventHandler } from '../handler/z21-event-handler';
import type { AppWsServer } from '../infra/ws/app-websocket-server';
import type { CommandStationInfoOrchestrator } from '../services/command-station-info-orchestrator';
import type { CvProgrammingService } from '../services/cv-programming-service';

import { Bootstrap } from './bootstrap';
import type { Providers } from './providers';

type TestProviders = DeepMocked<Providers> & {
	onConnection: Mock;
};

describe('Bootstrap Z21 session', () => {
	let providers: TestProviders;

	function createProviders(): TestProviders {
		const udp = DeepMock<Z21Udp>();
		const wsServer = DeepMock<AppWsServer>();
		const z21CommandService = DeepMock<Z21CommandService>();
		const z21EventHandler = DeepMock<Z21EventHandler>();
		const locoManager = DeepMock<LocoManager>();
		const csInfoOrchestrator = DeepMock<CommandStationInfoOrchestrator>();
		const cvProgrammingService = DeepMock<CvProgrammingService>();
		const commandStationInfo = DeepMock<CommandStationInfo>();
		const logger = DeepMock<Logger>();
		const httpServer = DeepMock<http.Server>();

		const onConnection = vi.fn();

		wsServer.onConnection = onConnection;

		httpServer.listen.mockReturnValue(httpServer);

		httpServer.close.mockReturnValue(httpServer);

		locoManager.subscribeLocoInfoOnce.mockReturnValue(false);

		const cfg: ServerConfig = {
			httpPort: 5050,
			z21: {
				host: '1.2.3.4',
				udpPort: 21105
			},
			safety: {
				stopAllOnClientDisconnect: false
			}
		};

		return {
			cfg,
			logger,
			httpServer,
			wsServer,
			udp,
			commandStationInfo,
			z21CommandService,
			csInfoOrchestrator,
			locoManager,
			z21EventHandler,
			cvProgrammingService,
			onConnection
		};
	}

	function getConnectionHandlers(): {
		onDisconnect: (ws: unknown) => void;
		onConnect: (ws: unknown) => void;
	} {
		const [, onDisconnect, onConnect] = providers.onConnection.mock.calls[0];

		return {
			onDisconnect,
			onConnect
		};
	}

	beforeEach(() => {
		vi.useFakeTimers();
		providers = createProviders();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('activates the Z21 session when the first client connects', () => {
		new Bootstrap(providers).start();

		const { onConnect } = getConnectionHandlers();

		onConnect({});

		expect(providers.csInfoOrchestrator.reset).toHaveBeenCalledOnce();

		expect(providers.csInfoOrchestrator.poke).toHaveBeenCalledOnce();

		expect(providers.z21CommandService.setBroadcastFlags).toHaveBeenCalledWith(Z21BroadcastFlag.NONE);

		expect(providers.z21CommandService.getSystemState).toHaveBeenCalledOnce();
	});

	it('does not activate the session again for additional clients', () => {
		new Bootstrap(providers).start();

		const { onConnect } = getConnectionHandlers();

		onConnect({});

		providers.csInfoOrchestrator.reset.mockClear();
		providers.csInfoOrchestrator.poke.mockClear();
		providers.z21CommandService.setBroadcastFlags.mockClear();
		providers.z21CommandService.getSystemState.mockClear();

		onConnect({});

		expect(providers.csInfoOrchestrator.reset).not.toHaveBeenCalled();

		expect(providers.csInfoOrchestrator.poke).not.toHaveBeenCalled();

		expect(providers.z21CommandService.setBroadcastFlags).not.toHaveBeenCalled();

		expect(providers.z21CommandService.getSystemState).not.toHaveBeenCalled();
	});

	it('requests system state every minute while the session is active', () => {
		new Bootstrap(providers).start();

		const { onConnect } = getConnectionHandlers();

		onConnect({});

		providers.z21CommandService.getSystemState.mockClear();

		vi.advanceTimersByTime(60_000);

		expect(providers.z21CommandService.getSystemState).toHaveBeenCalledOnce();

		vi.advanceTimersByTime(120_000);

		expect(providers.z21CommandService.getSystemState).toHaveBeenCalledTimes(3);
	});

	it('keeps the session active while clients remain connected', () => {
		new Bootstrap(providers).start();

		const { onConnect, onDisconnect } = getConnectionHandlers();

		const firstClient = {};
		const secondClient = {};

		onConnect(firstClient);
		onConnect(secondClient);

		providers.z21CommandService.logOff.mockClear();

		onDisconnect(firstClient);

		expect(providers.z21CommandService.logOff).not.toHaveBeenCalled();
	});

	it('deactivates the session when the last client disconnects', () => {
		new Bootstrap(providers).start();

		const { onConnect, onDisconnect } = getConnectionHandlers();

		const client = {};

		onConnect(client);

		providers.csInfoOrchestrator.reset.mockClear();

		onDisconnect(client);

		expect(providers.csInfoOrchestrator.reset).toHaveBeenCalledOnce();

		expect(providers.z21CommandService.logOff).toHaveBeenCalledOnce();
	});

	it('stops the heartbeat when the last client disconnects', () => {
		new Bootstrap(providers).start();

		const { onConnect, onDisconnect } = getConnectionHandlers();

		const client = {};

		onConnect(client);

		providers.z21CommandService.getSystemState.mockClear();

		onDisconnect(client);

		vi.advanceTimersByTime(120_000);

		expect(providers.z21CommandService.getSystemState).not.toHaveBeenCalled();
	});

	it('does not log off when disconnecting without an active session', () => {
		new Bootstrap(providers).start();

		const { onDisconnect } = getConnectionHandlers();

		onDisconnect({});

		expect(providers.z21CommandService.logOff).not.toHaveBeenCalled();
	});

	it('deactivates an active session during application shutdown', () => {
		const bootstrap = new Bootstrap(providers);

		bootstrap.start();

		const { onConnect } = getConnectionHandlers();

		onConnect({});

		providers.z21CommandService.logOff.mockClear();

		bootstrap.stop();

		expect(providers.z21CommandService.logOff).toHaveBeenCalledOnce();

		providers.z21CommandService.getSystemState.mockClear();

		vi.advanceTimersByTime(120_000);

		expect(providers.z21CommandService.getSystemState).not.toHaveBeenCalled();
	});

	describe('broadcast flags', () => {
		it('uses no broadcast flags when configuration is missing', () => {
			providers.cfg.z21.broadcastflags = undefined;

			new Bootstrap(providers).start();

			const { onConnect } = getConnectionHandlers();

			onConnect({});

			expect(providers.z21CommandService.setBroadcastFlags).toHaveBeenCalledWith(Z21BroadcastFlag.NONE);
		});

		it('combines enabled broadcast flags', () => {
			providers.cfg.z21.broadcastflags = {
				basic: true,
				rMbus: false,
				railcom: true,
				systemState: false,
				changedLocoInfo: true,
				locoNetWithoutLocoAndSwitches: false,
				locoNetWithLocoAndSwitches: true,
				locoNetDetector: false,
				railcomDatachanged: true
			};

			new Bootstrap(providers).start();

			const { onConnect } = getConnectionHandlers();

			onConnect({});

			expect(providers.z21CommandService.setBroadcastFlags).toHaveBeenCalledWith(
				Z21BroadcastFlag.BASIC |
					Z21BroadcastFlag.RAILCOM |
					Z21BroadcastFlag.CHANGED_LOCO_INFO |
					Z21BroadcastFlag.LOCO_NET_WITH_LOCO_AND_SWITCHES |
					Z21BroadcastFlag.RAILCOM_DATACHANGED
			);
		});

		it('uses no flags when every configured flag is disabled', () => {
			providers.cfg.z21.broadcastflags = {
				basic: false,
				rMbus: false,
				railcom: false,
				systemState: false,
				changedLocoInfo: false,
				locoNetWithoutLocoAndSwitches: false,
				locoNetWithLocoAndSwitches: false,
				locoNetDetector: false,
				railcomDatachanged: false
			};

			new Bootstrap(providers).start();

			const { onConnect } = getConnectionHandlers();

			onConnect({});

			expect(providers.z21CommandService.setBroadcastFlags).toHaveBeenCalledWith(Z21BroadcastFlag.NONE);
		});
	});
});
