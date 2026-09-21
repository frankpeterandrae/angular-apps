/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ServerToClient } from '@application-platform/protocol';
import { Z21BroadcastFlag } from '@application-platform/z21';
import type { Broadcastflags } from '@application-platform/z21-shared';
import { type WebSocket as WsWebSocket } from 'ws';

import { ClientMessageHandler } from '../handler/client-message-handler';

import { type Providers } from './providers';

const BROADCAST_FLAGS: ReadonlyArray<{
	key: keyof Broadcastflags;
	value: Z21BroadcastFlag;
}> = [
	{ key: 'basic', value: Z21BroadcastFlag.BASIC },
	{ key: 'rMbus', value: Z21BroadcastFlag.R_MBUS },
	{ key: 'railcom', value: Z21BroadcastFlag.RAILCOM },
	{ key: 'systemState', value: Z21BroadcastFlag.SYSTEM_STATE },
	{ key: 'changedLocoInfo', value: Z21BroadcastFlag.CHANGED_LOCO_INFO },
	{
		key: 'locoNetWithoutLocoAndSwitches',
		value: Z21BroadcastFlag.LOCO_NET_WITHOUT_LOCO_AND_SWITCHES
	},
	{
		key: 'locoNetWithLocoAndSwitches',
		value: Z21BroadcastFlag.LOCO_NET_WITH_LOCO_AND_SWITCHES
	},
	{
		key: 'locoNetDetector',
		value: Z21BroadcastFlag.LOCO_NET_DETECTOR
	},
	{
		key: 'railcomDatachanged',
		value: Z21BroadcastFlag.RAILCOM_DATACHANGED
	}
];

/**
 * Coordinates application startup, shutdown, WebSocket wiring,
 * and the lifecycle of the active Z21 session.
 */
export class Bootstrap {
	private readonly clientMessageHandler: ClientMessageHandler;
	private wsClientCount = 0;
	private wsClientSeq = 0;
	private readonly wsClientIds = new WeakMap<object, number>();
	private z21SessionActive = false;
	private z21HeartbeatTimer: NodeJS.Timeout | null = null;

	constructor(private readonly providers: Providers) {
		const broadcast = (msg: ServerToClient): void => this.providers.wsServer.broadcast(msg);

		const replay = (ws: WsWebSocket, msg: ServerToClient): void => this.providers.wsServer.sendToClient(ws, msg);

		this.clientMessageHandler = new ClientMessageHandler(
			this.providers.locoManager,
			this.providers.z21CommandService,
			this.providers.cvProgrammingService,
			replay,
			broadcast
		);
	}

	/**
	 * Starts the application services and wires transport handlers.
	 *
	 * @returns This bootstrap instance.
	 */
	public start(): this {
		this.wireUdp();
		this.wireWs();
		this.startZ21();
		this.startHttpServer();
		return this;
	}

	/**
	 * Stops the active Z21 session and all application servers.
	 */
	public stop(): void {
		try {
			this.deactivateZ21Session();
		} catch {
			// Intentionally ignore errors during shutdown
		}

		try {
			this.providers.udp.stop();
		} catch {
			// Intentionally ignore errors during shutdown
		}

		try {
			this.providers.wsServer.close();
		} catch {
			// Intentionally ignore errors during shutdown
		}

		try {
			this.providers.httpServer.close();
		} catch {
			// Intentionally ignore errors during shutdown
		}
	}

	private wireUdp(): void {
		this.providers.udp.on('datagram', (datagram) => this.providers.z21EventHandler.handleDatagram(datagram));
	}

	private wireWs(): void {
		this.providers.wsServer.onConnection(
			(msg, ws) => this.clientMessageHandler.handle(msg, ws),
			(ws) => this.handleClientDisconnect(ws),
			(ws) => this.handleClientConnected(ws)
		);
	}

	private handleClientDisconnect(ws: unknown): void {
		const id = ws && typeof ws === 'object' ? this.getWsClientId(ws) : undefined;
		this.wsClientCount = Math.max(0, this.wsClientCount - 1);

		this.providers.logger.info('ws.client.disconnected', {
			clientId: id,
			totalClients: this.wsClientCount
		});

		if (this.wsClientCount === 0) {
			this.deactivateZ21Session();
		}

		if (!this.providers.cfg.safety.stopAllOnClientDisconnect) return;

		const stopped = this.providers.locoManager.stopAll();
		for (const { addr, state } of stopped) {
			this.providers.wsServer.broadcast({
				type: 'loco.message.state',
				payload: {
					addr,
					speed: 0,
					dir: state.dir,
					fns: state.fns,
					estop: state.estop
				}
			});
		}
	}

	private handleClientConnected(ws: unknown): void {
		this.wsClientCount++;

		const id = ws && typeof ws === 'object' ? this.getWsClientId(ws) : undefined;

		this.providers.logger.info('ws.client.connected', {
			clientId: id,
			totalClients: this.wsClientCount
		});

		if (this.wsClientCount === 1) {
			this.activateZ21Session();
		}

		const addr = this.providers.cfg.dev?.subscribeLocoAddr;
		if (!addr) return;

		if (this.providers.locoManager.subscribeLocoInfoOnce(addr)) {
			this.providers.z21CommandService.getLocoInfo(addr);
		}
	}

	private startZ21(): void {
		this.providers.udp.start(this.providers.cfg.z21.listenPort ?? 21105);
	}

	private startHttpServer(): void {
		this.providers.httpServer.listen(this.providers.cfg.httpPort, () => {
			this.providers.logger.info('server.started', {
				httpPort: this.providers.cfg.httpPort,
				z21Host: this.providers.cfg.z21.host,
				z21UdpPort: this.providers.cfg.z21.udpPort,
				z21ListenPort: this.providers.cfg.z21.listenPort
			});
		});
	}

	private activateZ21Session(): void {
		if (this.z21SessionActive) return;

		this.z21SessionActive = true;
		this.providers.logger.info('z21.session.activate', {
			reason: 'first client connected',
			wsClientCount: this.wsClientCount
		});

		this.providers.csInfoOrchestrator.reset();
		this.providers.csInfoOrchestrator.poke();

		this.setBroadcast();
		this.providers.z21CommandService.getSystemState();
		this.startZ21Heartbeat();
	}

	private setBroadcast(): void {
		const config = this.providers.cfg.z21.broadcastflags;

		const flags = BROADCAST_FLAGS.reduce(
			(result, entry) => (config?.[entry.key] ? result | entry.value : result),
			Z21BroadcastFlag.NONE
		);

		this.providers.z21CommandService.setBroadcastFlags(flags);
	}

	private deactivateZ21Session(): void {
		if (!this.z21SessionActive) return;

		this.z21SessionActive = false;
		this.providers.logger.info('z21.session.deactivate', {
			reason: 'last client disconnected',
			wsClientCount: this.wsClientCount
		});

		this.providers.csInfoOrchestrator.reset();
		this.stopZ21Heartbeat();
		this.providers.z21CommandService.logOff();
	}

	private startZ21Heartbeat(): void {
		const intervalMs = 60_000;

		this.stopZ21Heartbeat();

		this.z21HeartbeatTimer = setInterval(() => this.providers.z21CommandService.getSystemState(), intervalMs);

		// Don't keep the Node process alive just because of the heartbeat.
		this.z21HeartbeatTimer.unref();
	}

	private stopZ21Heartbeat(): void {
		if (!this.z21HeartbeatTimer) {
			return;
		}

		clearInterval(this.z21HeartbeatTimer);
		this.z21HeartbeatTimer = null;
	}

	private getWsClientId(ws: object): number {
		const existing = this.wsClientIds.get(ws);

		if (existing !== undefined) {
			return existing;
		}

		const id = ++this.wsClientSeq;
		this.wsClientIds.set(ws, id);

		return id;
	}
}
