/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type http from 'node:http';

import type { CommandStationInfo, LocoManager } from '@application-platform/domain';
import type { LocoDrive } from '@application-platform/protocol';
import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import type { Z21CommandService, Z21Udp } from '@application-platform/z21';
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
	broadcast: Mock;
};

describe('Bootstrap', () => {
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
		const broadcast = vi.fn();

		wsServer.onConnection = onConnection;
		wsServer.broadcast = broadcast;

		httpServer.listen.mockImplementation((_port, callback) => {
			callback?.();

			return httpServer;
		});

		httpServer.close.mockImplementation((callback) => {
			callback?.();

			return httpServer;
		});

		locoManager.subscribeLocoInfoOnce.mockReturnValue(false);

		const cfg: ServerConfig = {
			httpPort: 5050,
			z21: {
				host: '1.2.3.4',
				udpPort: 21105,
				broadcastflags: {
					basic: true
				}
			},
			safety: {
				stopAllOnClientDisconnect: true
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
			onConnection,
			broadcast
		};
	}

	beforeEach(() => {
		providers = createProviders();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('start', () => {
		it('starts UDP and HTTP services', () => {
			const bootstrap = new Bootstrap(providers);

			const result = bootstrap.start();

			expect(providers.udp.start).toHaveBeenCalledWith(21105);

			expect(providers.httpServer.listen).toHaveBeenCalledWith(5050, expect.any(Function));

			expect(result).toBe(bootstrap);
		});

		it('uses the configured UDP listen port', () => {
			providers.cfg.z21.listenPort = 30000;

			new Bootstrap(providers).start();

			expect(providers.udp.start).toHaveBeenCalledWith(30000);
		});

		it('wires incoming UDP datagrams to the Z21 event handler', () => {
			new Bootstrap(providers).start();

			const datagramHandler = providers.udp.on.mock.calls.find(([event]) => event === 'datagram')?.[1];

			const datagram = {
				raw: Buffer.from([0x04, 0x00]),
				rawHex: '0400',
				from: {
					address: '127.0.0.1',
					port: 21105
				}
			};

			datagramHandler?.(datagram);

			expect(providers.z21EventHandler.handleDatagram).toHaveBeenCalledWith(datagram);
		});

		it('wires WebSocket handlers', () => {
			new Bootstrap(providers).start();

			expect(providers.onConnection).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), expect.any(Function));
		});
	});

	describe('client messages', () => {
		it('delegates locomotive drive commands through the client message handler', () => {
			providers.locoManager.setSpeed.mockReturnValue({
				speed: 0.5,
				dir: 'FWD',
				fns: {},
				estop: false
			});

			new Bootstrap(providers).start();

			const [onMessage] = providers.onConnection.mock.calls[0];

			const message: LocoDrive = {
				type: 'loco.command.drive',
				payload: {
					addr: 5,
					speedStep: 63,
					dir: 'FWD'
				} as LocoDrive['payload']
			};

			onMessage(message);

			expect(providers.locoManager.setSpeed).toHaveBeenCalledWith(5, 0.5, 'FWD');
		});
	});

	describe('client connection', () => {
		it('requests configured locomotive information', () => {
			providers.cfg.dev = {
				subscribeLocoAddr: 1845
			};

			providers.locoManager.subscribeLocoInfoOnce.mockReturnValue(true);

			new Bootstrap(providers).start();

			const [, , onConnect] = providers.onConnection.mock.calls[0];

			onConnect({});

			expect(providers.locoManager.subscribeLocoInfoOnce).toHaveBeenCalledWith(1845);

			expect(providers.z21CommandService.getLocoInfo).toHaveBeenCalledWith(1845);
		});

		it('does not request locomotive information when already subscribed', () => {
			providers.cfg.dev = {
				subscribeLocoAddr: 1845
			};

			providers.locoManager.subscribeLocoInfoOnce.mockReturnValue(false);

			new Bootstrap(providers).start();

			const [, , onConnect] = providers.onConnection.mock.calls[0];

			onConnect({});

			expect(providers.z21CommandService.getLocoInfo).not.toHaveBeenCalled();
		});

		it('does not subscribe when no development locomotive is configured', () => {
			new Bootstrap(providers).start();

			const [, , onConnect] = providers.onConnection.mock.calls[0];

			onConnect({});

			expect(providers.locoManager.subscribeLocoInfoOnce).not.toHaveBeenCalled();

			expect(providers.z21CommandService.getLocoInfo).not.toHaveBeenCalled();
		});
	});

	describe('client disconnect', () => {
		it('stops and broadcasts all locomotives when safety is enabled', () => {
			providers.locoManager.stopAll.mockReturnValue([
				{
					addr: 3,
					state: {
						speed: 0,
						dir: 'FWD',
						fns: { 0: true },
						estop: false
					}
				},
				{
					addr: 7,
					state: {
						speed: 0,
						dir: 'REV',
						fns: { 2: false },
						estop: true
					}
				}
			]);

			new Bootstrap(providers).start();

			const [, onDisconnect] = providers.onConnection.mock.calls[0];

			onDisconnect({});

			expect(providers.locoManager.stopAll).toHaveBeenCalledOnce();

			expect(providers.broadcast).toHaveBeenNthCalledWith(1, {
				type: 'loco.message.state',
				payload: {
					addr: 3,
					speed: 0,
					dir: 'FWD',
					fns: { 0: true },
					estop: false
				}
			});

			expect(providers.broadcast).toHaveBeenNthCalledWith(2, {
				type: 'loco.message.state',
				payload: {
					addr: 7,
					speed: 0,
					dir: 'REV',
					fns: { 2: false },
					estop: true
				}
			});
		});

		it('does not stop locomotives when safety is disabled', () => {
			providers.cfg.safety.stopAllOnClientDisconnect = false;

			new Bootstrap(providers).start();

			const [, onDisconnect] = providers.onConnection.mock.calls[0];

			onDisconnect({});

			expect(providers.locoManager.stopAll).not.toHaveBeenCalled();

			expect(providers.broadcast).not.toHaveBeenCalled();
		});

		it('does not broadcast when no locomotives were stopped', () => {
			providers.locoManager.stopAll.mockReturnValue([]);

			new Bootstrap(providers).start();

			const [, onDisconnect] = providers.onConnection.mock.calls[0];

			onDisconnect({});

			expect(providers.broadcast).not.toHaveBeenCalled();
		});
	});

	describe('stop', () => {
		it('stops UDP, WebSocket and HTTP servers', () => {
			const bootstrap = new Bootstrap(providers);

			bootstrap.start();
			bootstrap.stop();

			expect(providers.udp.stop).toHaveBeenCalledOnce();

			expect(providers.wsServer.close).toHaveBeenCalledOnce();

			expect(providers.httpServer.close).toHaveBeenCalledOnce();
		});

		it('continues shutdown when individual services throw', () => {
			providers.udp.stop.mockImplementationOnce(() => {
				throw new Error('UDP');
			});

			providers.wsServer.close.mockImplementationOnce(() => {
				throw new Error('WS');
			});

			providers.httpServer.close.mockImplementationOnce(() => {
				throw new Error('HTTP');
			});

			const bootstrap = new Bootstrap(providers);

			expect(() => {
				bootstrap.stop();
			}).not.toThrow();

			expect(providers.udp.stop).toHaveBeenCalledOnce();

			expect(providers.wsServer.close).toHaveBeenCalledOnce();

			expect(providers.httpServer.close).toHaveBeenCalledOnce();
		});
	});
});
