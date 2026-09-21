/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { LocoManager, LocoState } from '@application-platform/domain';
import type { ClientToServer, ServerToClient } from '@application-platform/protocol';
import { LocoFunctionSwitchType, type Z21CommandService } from '@application-platform/z21';
import { TurnoutState, type Direction } from '@application-platform/z21-shared';
import type { WebSocket as WsWebSocket } from 'ws';

import type { CvProgrammingService } from '../services/cv-programming-service';

/** Sends a message to all connected clients. */
export type BroadcastFn = (msg: ServerToClient) => void;

/** Sends a message to a specific WebSocket client. */
export type ReplyFn = (ws: WsWebSocket, msg: ServerToClient) => void;

/**
 * Handles validated client commands and coordinates domain state,
 * Z21 commands, and client responses.
 */
export class ClientMessageHandler {
	private readonly driveThrottleMs = 50;

	private readonly pendingDrives = new Map<
		number,
		{
			speedStep: number;
			dir: Direction;
		}
	>();

	private readonly driveTimers = new Map<number, NodeJS.Timeout>();

	constructor(
		private readonly locoManager: LocoManager,
		private readonly z21Service: Z21CommandService,
		private readonly cvProgrammingService: CvProgrammingService,
		private readonly reply: ReplyFn,
		private readonly broadcast: BroadcastFn
	) {}

	/**
	 * Routes a validated client message to its command handler.
	 *
	 * @param message - Client message to process.
	 * @param ws - WebSocket connection that sent the message.
	 */
	public async handle(message: ClientToServer, ws: WsWebSocket): Promise<void> {
		switch (message.type) {
			case 'server.command.session.hello':
				return;

			case 'system.command.trackpower.set':
				this.handleTrackPower(message);
				return;

			case 'loco.command.drive':
				this.handleLocoDrive(message);
				return;

			case 'loco.command.function.set':
				this.handleLocoFunctionSet(message);
				return;

			case 'loco.command.function.toggle':
				this.handleLocoFunctionToggle(message);
				return;

			case 'loco.command.eStop':
				this.handleLocoEmergencyStop(message);
				return;

			case 'switching.command.turnout.set':
				this.handleTurnout(message);
				return;

			case 'loco.command.stop.all':
				this.z21Service.setStop();
				return;

			case 'programming.command.cv.read':
				await this.handleCvRead(message, ws);
				return;

			case 'programming.command.cv.write':
				await this.handleCvWrite(message, ws);
				return;

			case 'programming.command.pom.cv.read':
			case 'programming.command.pom.cv.write':
				return;
		}
	}

	private handleTrackPower(message: Extract<ClientToServer, { type: 'system.command.trackpower.set' }>): void {
		const { powerOn } = message.payload;

		this.z21Service.sendTrackPower(powerOn);

		this.broadcast({
			type: 'system.message.trackpower',
			payload: {
				powerOn,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		});
	}

	private handleLocoDrive(message: Extract<ClientToServer, { type: 'loco.command.drive' }>): void {
		const { addr, speedStep, dir } = message.payload;

		const speed = speedStep / 126;

		const state = this.locoManager.setSpeed(addr, speed, dir);

		this.pendingDrives.set(addr, {
			speedStep,
			dir
		});

		this.scheduleDrive(addr);
		this.broadcastLocoState(addr, state);
	}

	private handleLocoFunctionSet(message: Extract<ClientToServer, { type: 'loco.command.function.set' }>): void {
		const { addr, fn, on } = message.payload;

		const state = this.locoManager.setFunction(addr, fn, on);

		this.z21Service.setLocoFunction(addr, fn, on ? LocoFunctionSwitchType.ON : LocoFunctionSwitchType.OFF);

		this.broadcastLocoState(addr, state);
	}

	private handleLocoFunctionToggle(message: Extract<ClientToServer, { type: 'loco.command.function.toggle' }>): void {
		const { addr, fn } = message.payload;

		const currentState = this.locoManager.getState(addr);

		const state = this.locoManager.setFunction(addr, fn, !(currentState?.fns[fn] ?? false));

		this.z21Service.setLocoFunction(addr, fn, LocoFunctionSwitchType.TOGGLE);

		this.broadcastLocoState(addr, state);
	}

	private handleLocoEmergencyStop(message: Extract<ClientToServer, { type: 'loco.command.eStop' }>): void {
		const { addr } = message.payload;

		const timer = this.driveTimers.get(addr);

		if (timer) {
			clearTimeout(timer);
		}

		this.driveTimers.delete(addr);
		this.pendingDrives.delete(addr);

		this.z21Service.setLocoEStop(addr);
		this.z21Service.getLocoInfo(addr);
	}

	private handleTurnout(
		message: Extract<
			ClientToServer,
			{
				type: 'switching.command.turnout.set';
			}
		>
	): void {
		const { addr, state, pulseMs } = message.payload;

		const port: 0 | 1 = state === TurnoutState.DIVERGING ? 1 : 0;

		this.z21Service.setTurnout(addr, port, {
			queue: true,
			pulseMs: pulseMs ?? 100
		});

		this.z21Service.getTurnoutInfo(addr);
	}

	private async handleCvRead(message: Extract<ClientToServer, { type: 'programming.command.cv.read' }>, ws: WsWebSocket): Promise<void> {
		const { requestId, cvAddress } = message.payload;

		try {
			const result = await this.cvProgrammingService.readCv(cvAddress);

			this.reply(ws, {
				type: 'programming.replay.cv.result',
				payload: {
					requestId,
					cvAddress: result.cvAddress,
					cvValue: result.cvValue
				}
			});
		} catch (error) {
			this.replyCvError(ws, requestId, error);
		}
	}

	private async handleCvWrite(
		message: Extract<ClientToServer, { type: 'programming.command.cv.write' }>,
		ws: WsWebSocket
	): Promise<void> {
		const { requestId, cvAddress, cvValue } = message.payload;

		try {
			await this.cvProgrammingService.writeCv(cvAddress, cvValue);

			this.reply(ws, {
				type: 'programming.replay.cv.result',
				payload: {
					requestId,
					cvAddress,
					cvValue
				}
			});
		} catch (error) {
			this.replyCvError(ws, requestId, error);
		}
	}

	private replyCvError(ws: WsWebSocket, requestId: string, error: unknown): void {
		this.reply(ws, {
			type: 'programming.replay.cv.nack',
			payload: {
				requestId,
				error: this.getErrorMessage(error)
			}
		});
	}

	private getErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}

	private broadcastLocoState(addr: number, state: LocoState): void {
		this.broadcast({
			type: 'loco.message.state',
			payload: {
				addr,
				speed: state.speed,
				dir: state.dir,
				fns: state.fns,
				estop: state.estop
			}
		});
	}

	private scheduleDrive(addr: number): void {
		if (this.driveTimers.has(addr)) {
			return;
		}

		const timer = setTimeout(() => {
			this.driveTimers.delete(addr);

			const next = this.pendingDrives.get(addr);

			if (!next) {
				return;
			}

			this.pendingDrives.delete(addr);

			this.z21Service.setLocoDrive(addr, next.speedStep, next.dir);
		}, this.driveThrottleMs);

		this.driveTimers.set(addr, timer);
	}
}
