/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { LocoManager } from '@application-platform/domain';
import type {
	ClientToServer,
	LocoDrive,
	LocoFunctionSet,
	LocoFunctionToggle,
	TrackPowerSet,
	TurnoutSet
} from '@application-platform/protocol';
import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import { LocoFunctionSwitchType, type Z21CommandService } from '@application-platform/z21';
import { TurnoutState } from '@application-platform/z21-shared';
import { afterEach, beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import type { WebSocket as WsWebSocket } from 'ws';

import type { CvProgrammingService } from '../services/cv-programming-service';

import { ClientMessageHandler, type BroadcastFn, type ReplyFn } from './client-message-handler';

describe('ClientMessageHandler', () => {
	let handler: ClientMessageHandler;
	let locoManager: DeepMocked<LocoManager>;
	let z21Service: DeepMocked<Z21CommandService>;
	let cvProgrammingService: DeepMocked<CvProgrammingService>;
	let broadcast: MockedFunction<BroadcastFn>;
	let reply: MockedFunction<ReplyFn>;

	const ws = {} as WsWebSocket;

	beforeEach(() => {
		locoManager = DeepMock<LocoManager>();
		z21Service = DeepMock<Z21CommandService>();
		cvProgrammingService = DeepMock<CvProgrammingService>();

		broadcast = vi.fn();
		reply = vi.fn();

		locoManager.setSpeed.mockReturnValue({
			speed: 0,
			dir: 'FWD',
			fns: {},
			estop: false
		});

		locoManager.setFunction.mockReturnValue({
			speed: 0,
			dir: 'FWD',
			fns: {},
			estop: false
		});

		locoManager.getState.mockReturnValue({
			speed: 0,
			dir: 'FWD',
			fns: {},
			estop: false
		});

		handler = new ClientMessageHandler(locoManager, z21Service, cvProgrammingService, reply, broadcast);
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
	});

	it('ignores session hello messages', async () => {
		await handler.handle(
			{
				type: 'server.command.session.hello'
			} as ClientToServer,
			ws
		);

		expect(broadcast).not.toHaveBeenCalled();
		expect(reply).not.toHaveBeenCalled();
	});

	it('sets track power and broadcasts the requested state', async () => {
		await handler.handle(
			{
				type: 'system.command.trackpower.set',
				payload: {
					powerOn: true
				} as TrackPowerSet['payload']
			},
			ws
		);

		expect(z21Service.sendTrackPower).toHaveBeenCalledWith(true);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		});
	});

	describe('locomotive drive', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('updates local state immediately and sends the drive command after the throttle interval', async () => {
			locoManager.setSpeed.mockReturnValue({
				speed: 0.5,
				dir: 'REV',
				fns: { 0: true },
				estop: false
			});

			await handler.handle(
				{
					type: 'loco.command.drive',
					payload: {
						requestId: 'req-1',
						addr: 5,
						speedStep: 63,
						dir: 'REV'
					}
				},
				ws
			);

			expect(locoManager.setSpeed).toHaveBeenCalledWith(5, 63 / 126, 'REV');

			expect(z21Service.setLocoDrive).not.toHaveBeenCalled();

			expect(broadcast).toHaveBeenCalledWith({
				type: 'loco.message.state',
				payload: {
					addr: 5,
					speed: 63 / 126,
					dir: 'REV',
					fns: { 0: true },
					estop: false
				}
			});

			vi.advanceTimersByTime(50);

			expect(z21Service.setLocoDrive).toHaveBeenCalledWith(5, 63, 'REV');
		});

		it('sends only the most recent pending drive command for one locomotive', async () => {
			await handler.handle(
				{
					type: 'loco.command.drive',
					payload: {
						addr: 5,
						speedStep: 25,
						dir: 'FWD'
					} as unknown as LocoDrive['payload']
				},
				ws
			);

			await handler.handle(
				{
					type: 'loco.command.drive',
					payload: {
						addr: 5,
						speedStep: 100,
						dir: 'REV'
					} as unknown as LocoDrive['payload']
				},
				ws
			);

			vi.advanceTimersByTime(50);

			expect(z21Service.setLocoDrive).toHaveBeenCalledOnce();

			expect(z21Service.setLocoDrive).toHaveBeenCalledWith(5, 100, 'REV');
		});

		it('cancels a pending drive when emergency stop is requested', async () => {
			await handler.handle(
				{
					type: 'loco.command.drive',
					payload: {
						addr: 5,
						speed: 0.8,
						dir: 'FWD'
					} as unknown as LocoDrive['payload']
				},
				ws
			);

			await handler.handle(
				{
					type: 'loco.command.eStop',
					payload: {
						addr: 5
					} as LocoDrive['payload']
				},
				ws
			);

			vi.advanceTimersByTime(50);

			expect(z21Service.setLocoDrive).not.toHaveBeenCalled();

			expect(z21Service.setLocoEStop).toHaveBeenCalledWith(5);

			expect(z21Service.getLocoInfo).toHaveBeenCalledWith(5);
		});
	});

	it.each([
		[true, LocoFunctionSwitchType.ON],
		[false, LocoFunctionSwitchType.OFF]
	])('sets a locomotive function and broadcasts the resulting state', async (on, expectedSwitchType) => {
		locoManager.setFunction.mockReturnValue({
			speed: 0.3,
			dir: 'FWD',
			fns: { 2: on },
			estop: false
		});

		await handler.handle(
			{
				type: 'loco.command.function.set',
				payload: {
					addr: 7,
					fn: 2,
					on
				} as LocoFunctionSet['payload']
			},
			ws
		);

		expect(locoManager.setFunction).toHaveBeenCalledWith(7, 2, on);

		expect(z21Service.setLocoFunction).toHaveBeenCalledWith(7, 2, expectedSwitchType);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'loco.message.state',
			payload: {
				addr: 7,
				speed: 0.3,
				dir: 'FWD',
				fns: { 2: on },
				estop: false
			}
		});
	});

	it('toggles a locomotive function based on the current state', async () => {
		locoManager.getState.mockReturnValue({
			speed: 0,
			dir: 'FWD',
			fns: {
				3: true
			},
			estop: false
		});

		locoManager.setFunction.mockReturnValue({
			speed: 0,
			dir: 'FWD',
			fns: {
				3: false
			},
			estop: false
		});

		await handler.handle(
			{
				type: 'loco.command.function.toggle',
				payload: {
					addr: 9,
					fn: 3
				} as LocoFunctionToggle['payload']
			},
			ws
		);

		expect(locoManager.setFunction).toHaveBeenCalledWith(9, 3, false);

		expect(z21Service.setLocoFunction).toHaveBeenCalledWith(9, 3, LocoFunctionSwitchType.TOGGLE);
	});

	it.each([
		[TurnoutState.STRAIGHT, 0],
		[TurnoutState.DIVERGING, 1]
	] as const)('sets turnout state using the corresponding port', async (state, expectedPort) => {
		await handler.handle(
			{
				type: 'switching.command.turnout.set',
				payload: {
					addr: 42,
					state,
					pulseMs: 250
				} as TurnoutSet['payload']
			},
			ws
		);

		expect(z21Service.setTurnout).toHaveBeenCalledWith(42, expectedPort, {
			queue: true,
			pulseMs: 250
		});

		expect(z21Service.getTurnoutInfo).toHaveBeenCalledWith(42);
	});

	it('uses the default turnout pulse duration', async () => {
		await handler.handle(
			{
				type: 'switching.command.turnout.set',
				payload: {
					addr: 42,
					state: TurnoutState.STRAIGHT
				} as TurnoutSet['payload']
			},
			ws
		);

		expect(z21Service.setTurnout).toHaveBeenCalledWith(42, 0, {
			queue: true,
			pulseMs: 100
		});
	});

	it('sends the global stop command', async () => {
		await handler.handle(
			{
				type: 'loco.command.stop.all'
			} as ClientToServer,
			ws
		);

		expect(z21Service.setStop).toHaveBeenCalledOnce();
	});

	describe('CV programming', () => {
		it('replies with the CV result after a successful read', async () => {
			cvProgrammingService.readCv.mockResolvedValue({
				cvAddress: 29,
				cvValue: 42
			});

			await handler.handle(
				{
					type: 'programming.command.cv.read',
					payload: {
						requestId: 'read-1',
						cvAddress: 29
					}
				},
				ws
			);

			expect(cvProgrammingService.readCv).toHaveBeenCalledWith(29);

			expect(reply).toHaveBeenCalledWith(ws, {
				type: 'programming.replay.cv.result',
				payload: {
					requestId: 'read-1',
					cvAddress: 29,
					cvValue: 42
				}
			});
		});

		it('replies with a nack when reading a CV fails', async () => {
			cvProgrammingService.readCv.mockRejectedValue(new Error('read failed'));

			await handler.handle(
				{
					type: 'programming.command.cv.read',
					payload: {
						requestId: 'read-1',
						cvAddress: 29
					}
				},
				ws
			);

			expect(reply).toHaveBeenCalledWith(ws, {
				type: 'programming.replay.cv.nack',
				payload: {
					requestId: 'read-1',
					error: 'read failed'
				}
			});
		});

		it('replies with the written value after a successful write', async () => {
			cvProgrammingService.writeCv.mockResolvedValue(undefined);

			await handler.handle(
				{
					type: 'programming.command.cv.write',
					payload: {
						requestId: 'write-1',
						cvAddress: 8,
						cvValue: 7
					}
				},
				ws
			);

			expect(cvProgrammingService.writeCv).toHaveBeenCalledWith(8, 7);

			expect(reply).toHaveBeenCalledWith(ws, {
				type: 'programming.replay.cv.result',
				payload: {
					requestId: 'write-1',
					cvAddress: 8,
					cvValue: 7
				}
			});
		});

		it('replies with a nack when writing a CV fails', async () => {
			cvProgrammingService.writeCv.mockRejectedValue('write failed');

			await handler.handle(
				{
					type: 'programming.command.cv.write',
					payload: {
						requestId: 'write-1',
						cvAddress: 8,
						cvValue: 7
					}
				},
				ws
			);

			expect(reply).toHaveBeenCalledWith(ws, {
				type: 'programming.replay.cv.nack',
				payload: {
					requestId: 'write-1',
					error: 'write failed'
				}
			});
		});
	});

	it.each(['programming.command.pom.cv.read', 'programming.command.pom.cv.write'] as const)(
		'ignores unsupported %s commands',
		async (type) => {
			await handler.handle(
				{
					type
				} as ClientToServer,
				ws
			);

			expect(cvProgrammingService.readCv).not.toHaveBeenCalled();

			expect(cvProgrammingService.writeCv).not.toHaveBeenCalled();

			expect(reply).not.toHaveBeenCalled();
		}
	);
});
