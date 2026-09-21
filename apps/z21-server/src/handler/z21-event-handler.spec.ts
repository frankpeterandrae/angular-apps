/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { CommandStationInfo, LocoManager } from '@application-platform/domain';
import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import type { SystemStateDecoder, Z21Codec, Z21Dataset, Z21DatasetEventMapper, Z21UdpDatagram } from '@application-platform/z21';
import {
	TurnoutState,
	Z21EventName,
	type LocoInfoEvent,
	type Logger,
	type SystemStateEvent,
	type Z21Event
} from '@application-platform/z21-shared';
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';

import type { CommandStationInfoOrchestrator } from '../services/command-station-info-orchestrator';
import type { CvProgrammingService } from '../services/cv-programming-service';

import { Z21EventHandler, type BroadcastFn } from './z21-event-handler';

describe('Z21EventHandler', () => {
	let handler: Z21EventHandler;

	let broadcast: MockedFunction<BroadcastFn>;
	let locoManager: DeepMocked<LocoManager>;
	let logger: DeepMocked<Logger>;
	let commandStationInfo: DeepMocked<CommandStationInfo>;
	let csInfoOrchestrator: DeepMocked<CommandStationInfoOrchestrator>;
	let cvProgrammingService: DeepMocked<CvProgrammingService>;
	let codec: DeepMocked<Z21Codec>;
	let datasetEventMapper: DeepMocked<Z21DatasetEventMapper>;
	let systemStateDecoder: DeepMocked<SystemStateDecoder>;

	function createDatagram(rawHex = '04000000'): Z21UdpDatagram {
		return {
			raw: Buffer.from([0x04, 0x00, 0x00, 0x00]),
			rawHex,
			from: {
				address: '127.0.0.1',
				port: 21105
			}
		};
	}

	function process(dataset: Z21Dataset, event?: Z21Event, datagram = createDatagram()): void {
		codec.parseZ21Datagram.mockReturnValue([dataset]);

		datasetEventMapper.map.mockReturnValue(event ? [event] : []);

		handler.handleDatagram(datagram);
	}

	beforeEach(() => {
		broadcast = vi.fn();

		locoManager = DeepMock<LocoManager>();
		logger = DeepMock<Logger>();
		commandStationInfo = DeepMock<CommandStationInfo>();
		csInfoOrchestrator = DeepMock<CommandStationInfoOrchestrator>();
		cvProgrammingService = DeepMock<CvProgrammingService>();
		codec = DeepMock<Z21Codec>();
		datasetEventMapper = DeepMock<Z21DatasetEventMapper>();
		systemStateDecoder = DeepMock<SystemStateDecoder>();

		handler = new Z21EventHandler(
			broadcast,
			locoManager,
			logger,
			commandStationInfo,
			csInfoOrchestrator,
			cvProgrammingService,
			codec,
			datasetEventMapper,
			systemStateDecoder
		);
	});

	it('parses incoming datagrams and maps usable datasets to events', () => {
		const datagram = createDatagram();
		const dataset: Z21Dataset = {
			kind: 'ds.code',
			code: 2
		};

		codec.parseZ21Datagram.mockReturnValue([dataset]);

		datasetEventMapper.map.mockReturnValue([]);

		handler.handleDatagram(datagram);

		expect(codec.parseZ21Datagram).toHaveBeenCalledWith(datagram.raw);

		expect(datasetEventMapper.map).toHaveBeenCalledWith(dataset);
	});

	describe('diagnostic datasets', () => {
		it('logs unknown frames without mapping them', () => {
			const dataset: Z21Dataset = {
				kind: 'ds.unknown',
				header: 0x9999,
				payload: Uint8Array.from([0x01, 0x02]),
				reason: 'unsupported'
			};

			codec.parseZ21Datagram.mockReturnValue([dataset]);

			handler.handleDatagram(createDatagram('deadbeef'));

			expect(logger.warn).toHaveBeenCalledWith('z21.unknown', {
				scope: 'frame',
				unknownKind: 'unknown',
				from: {
					address: '127.0.0.1',
					port: 21105
				},
				header: 0x9999,
				reason: 'unsupported',
				payload: [1, 2],
				hex: 'deadbeef'
			});

			expect(datasetEventMapper.map).not.toHaveBeenCalled();
		});

		it('logs invalid X-Bus checksums without mapping them', () => {
			const dataset: Z21Dataset = {
				kind: 'ds.bad_xor',
				calc: '42',
				recv: '43'
			};

			codec.parseZ21Datagram.mockReturnValue([dataset]);

			handler.handleDatagram(createDatagram('cafebabe'));

			expect(logger.warn).toHaveBeenCalledWith('z21.unknown', {
				scope: 'frame',
				unknownKind: 'bad_xor',
				from: {
					address: '127.0.0.1',
					port: 21105
				},
				calc: '42',
				recv: '43',
				hex: 'cafebabe'
			});

			expect(datasetEventMapper.map).not.toHaveBeenCalled();
		});
	});

	it('broadcasts serial information received from the mapper', () => {
		const event: Z21Event = {
			event: Z21EventName.SERIAL,
			payload: {
				serial: 123,
				raw: [123, 0, 0, 0]
			}
		};

		process(
			{
				kind: 'ds.serial',
				serial: 123
			},
			event,
			createDatagram('080010007b000000')
		);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.z21.rx',
			payload: {
				rawHex: '080010007b000000',
				datasets: [
					{
						kind: 'ds.serial',
						serial: 123,
						from: {
							address: '127.0.0.1',
							port: 21105
						}
					}
				],
				events: [event]
			}
		});
	});

	it('processes a system state event exactly once', () => {
		systemStateDecoder.deriveTrackFlags.mockReturnValue({
			powerOn: true,
			emergencyStop: false,
			shortCircuit: false,
			programmingMode: true
		});

		const event: Z21Event = {
			event: Z21EventName.SYSTEM_STATE,
			payload: {
				mainCurrentMa: 0,
				progCurrentMa: 0,
				filteredMainCurrentMa: 0,
				temperatureC: 0,
				supplyVoltageMv: 0,
				vccVoltageMv: 0,
				centralState: 0x20,
				centralStateEx: 0,
				capabilities: 0
			} as SystemStateEvent['payload']
		};

		process(
			{
				kind: 'ds.system.state',
				state: new Uint8Array(16)
			},
			event
		);

		expect(systemStateDecoder.deriveTrackFlags).toHaveBeenCalledOnce();

		expect(broadcast).toHaveBeenCalledOnce();

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				emergencyStop: false,
				shortCircuit: false,
				programmingMode: true,
				source: 'ds.system.state'
			}
		});
	});

	it.each([Z21EventName.TRACK_POWER, Z21EventName.STATUS] as const)('updates track state for %s events', (eventName) => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x61,
				data: new Uint8Array()
			},
			{
				event: eventName,
				payload: {
					powerOn: true,
					emergencyStop: false,
					shortCircuit: false,
					programmingMode: false
				}
			} as Z21Event
		);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				emergencyStop: false,
				shortCircuit: false,
				programmingMode: false,
				source: 'ds.lan.x'
			}
		});
	});

	it('updates the locomotive manager and broadcasts locomotive state', () => {
		const locoInfo = {
			addr: 12,
			speedSteps: 128 as const,
			speed: 0.5,
			emergencyStop: false,
			direction: 'FWD' as const,
			isMmLoco: false,
			isOccupied: true,
			isDoubleTraction: false,
			isSmartsearch: false,
			functionMap: {
				0: true
			}
		} as unknown as LocoInfoEvent['payload'];

		locoManager.updateLocoInfoFromZ21.mockReturnValue({
			addr: 12,
			state: {
				speed: 0.5,
				dir: 'FWD',
				fns: {
					0: true
				},
				estop: false
			}
		});

		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0xef,
				data: new Uint8Array()
			},
			{
				event: Z21EventName.LOCO_INFO,
				payload: locoInfo
			}
		);

		expect(locoManager.updateLocoInfoFromZ21).toHaveBeenCalledWith(locoInfo);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'loco.message.state',
			payload: {
				addr: 12,
				speed: 0.5,
				dir: 'FWD',
				fns: {
					0: true
				},
				estop: false
			}
		});
	});

	it('broadcasts turnout state', () => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x43,
				data: new Uint8Array()
			},
			{
				event: Z21EventName.TURNOUT_INFO,
				payload: {
					addr: 42,
					state: TurnoutState.DIVERGING,
					raw: []
				}
			}
		);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'switching.message.turnout.state',
			payload: {
				addr: 42,
				state: TurnoutState.DIVERGING
			}
		});
	});

	it('stores and broadcasts X-Bus version information', () => {
		const event: Z21Event = {
			event: Z21EventName.X_BUS_VERSION,
			payload: {
				xBusVersion: 0x30,
				xBusVersionString: '3.0',
				cmdsId: 0x12,
				raw: []
			}
		};

		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x63,
				data: new Uint8Array()
			},
			event
		);

		expect(commandStationInfo.setXBusVersion).toHaveBeenCalledWith(event.payload);

		expect(commandStationInfo.setHardwareType).toHaveBeenCalledWith('Z21_OLD');

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.hardware.info',
			payload: {
				hardwareType: 'Z21_OLD'
			}
		});

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.x.bus.version',
			payload: {
				version: '3.0',
				cmdsId: 0x12
			}
		});

		expect(csInfoOrchestrator.ack).toHaveBeenCalledWith('xBusVersion');

		expect(csInfoOrchestrator.ack.mock.invocationCallOrder[0]).toBeLessThan(csInfoOrchestrator.poke.mock.invocationCallOrder[0]);
	});

	it('does not derive a hardware type from unrelated X-Bus command station ids', () => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x63,
				data: new Uint8Array()
			},
			{
				event: Z21EventName.X_BUS_VERSION,
				payload: {
					xBusVersion: 0x30,
					xBusVersionString: '3.0',
					cmdsId: 0x14,
					raw: []
				}
			}
		);

		expect(commandStationInfo.setHardwareType).not.toHaveBeenCalled();
	});

	it('stores firmware information and acknowledges it before requesting more data', () => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0xf3,
				data: new Uint8Array()
			},
			{
				event: Z21EventName.FIRMWARE_VERSION,
				payload: {
					major: 1,
					minor: 42,
					raw: []
				}
			}
		);

		expect(commandStationInfo.setFirmwareVersion).toHaveBeenCalledWith({
			major: 1,
			minor: 42,
			raw: []
		});

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.firmware.version',
			payload: {
				major: 1,
				minor: 42
			}
		});

		expect(csInfoOrchestrator.ack).toHaveBeenCalledWith('firmware');

		expect(csInfoOrchestrator.ack.mock.invocationCallOrder[0]).toBeLessThan(csInfoOrchestrator.poke.mock.invocationCallOrder[0]);
	});

	it('stores hardware information and acknowledges it before requesting more data', () => {
		process(
			{
				kind: 'ds.hwinfo',
				hwtype: 0x00000204,
				fwVersionBcd: 0x00000125
			},
			{
				event: Z21EventName.Z21_HWINFO,
				payload: {
					hardwareType: 'z21_START',
					majorVersion: 1,
					minorVersion: 25,
					raw: []
				}
			}
		);

		expect(commandStationInfo.setFirmwareVersion).toHaveBeenCalledWith({
			major: 1,
			minor: 25
		});

		expect(commandStationInfo.setHardwareType).toHaveBeenCalledWith('z21_START');

		expect(csInfoOrchestrator.ack).toHaveBeenCalledWith('hwinfo');

		expect(csInfoOrchestrator.ack.mock.invocationCallOrder[0]).toBeLessThan(csInfoOrchestrator.poke.mock.invocationCallOrder[0]);
	});

	it('stores and broadcasts the command station code', () => {
		process(
			{
				kind: 'ds.code',
				code: 2
			},
			{
				event: Z21EventName.Z21_CODE,
				payload: {
					code: 2,
					raw: []
				}
			}
		);

		expect(commandStationInfo.setCode).toHaveBeenCalledWith(2);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.z21.code',
			payload: {
				code: 2
			}
		});

		expect(csInfoOrchestrator.ack).toHaveBeenCalledWith('code');
	});

	it('broadcasts a global emergency-stop event', () => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x81,
				data: new Uint8Array()
			},
			{
				event: Z21EventName.STOPPED,
				payload: {
					raw: []
				}
			}
		);

		expect(broadcast).toHaveBeenCalledWith({
			type: 'system.message.stop',
			payload: {}
		});
	});

	it.each([
		{
			event: Z21EventName.CV_RESULT,
			payload: {
				cv: 29,
				value: 42,
				raw: []
			}
		},
		{
			event: Z21EventName.CV_NACK,
			payload: {
				shortCircuit: false,
				raw: []
			}
		}
	] satisfies Z21Event[])('forwards $event to the CV programming service', (event) => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x64,
				data: new Uint8Array()
			},
			event
		);

		expect(cvProgrammingService.onEvent).toHaveBeenCalledWith(event);
	});

	it('logs unknown LAN-X events', () => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x40,
				data: new Uint8Array()
			},
			{
				event: Z21EventName.UNKNOWN_LAN_X,
				payload: {
					xHeader: 0x40,
					bytes: [1, 2],
					raw: []
				}
			}
		);

		expect(logger.warn).toHaveBeenCalledWith('z21.unknown', {
			scope: 'lan_x',
			unknownKind: Z21EventName.UNKNOWN_LAN_X,
			from: {
				address: '127.0.0.1',
				port: 21105
			},
			hex: '04000000'
		});
	});

	it('logs unknown X-Bus events with their payload', () => {
		process(
			{
				kind: 'ds.x.bus',
				xHeader: 0x88,
				data: new Uint8Array([0x01])
			},
			{
				event: Z21EventName.UNKNOWN_X_BUS,
				payload: {
					xHeader: 0x88,
					bytes: [0x01],
					raw: []
				}
			}
		);

		expect(logger.warn).toHaveBeenCalledWith('z21.unknown', {
			scope: 'x_bus',
			unknownKind: Z21EventName.UNKNOWN_X_BUS,
			from: {
				address: '127.0.0.1',
				port: 21105
			},
			hex: '04000000',
			xHeader: 0x88,
			bytes: [0x01]
		});
	});
});
