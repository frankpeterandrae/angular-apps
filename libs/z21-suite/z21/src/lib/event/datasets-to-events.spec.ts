/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type DeepMocked, DeepMock, resetMocksBeforeEach } from '@application-platform/shared-node-test';
import { LAN_X_COMMANDS, Z21EventName } from '@application-platform/z21-shared';

import type { Z21Dataset } from '../codec/codec-types';
import type { LanXDecoder } from '../lanx/decode/decoder';
import type { SystemInfoDecoder } from '../system/system-info-decoder';
import type { SystemStateDecoder } from '../system/system-state-decoder';

import { Z21DatasetEventMapper } from './datasets-to-events';

describe('Z21DatasetEventMapper', () => {
	let mapper: Z21DatasetEventMapper;
	let decodeLanXPayload: DeepMocked<LanXDecoder>;
	let systemInfoDecoder: DeepMocked<SystemInfoDecoder>;
	let systemStateDecoder: DeepMocked<SystemStateDecoder>;

	beforeEach(() => {
		decodeLanXPayload = DeepMock<LanXDecoder>();
		systemInfoDecoder = DeepMock<SystemInfoDecoder>();
		systemStateDecoder = DeepMock<SystemStateDecoder>();
		// Clear mocked functions
		resetMocksBeforeEach({ decodeLanXPayload, systemInfoDecoder, systemStateDecoder });

		decodeLanXPayload.decode.mockReturnValue([
			{
				event: Z21EventName.STATUS,
				payload: {
					powerOn: true,
					raw: [0x01, 0x00]
				} as any
			}
		]);

		mapper = new Z21DatasetEventMapper(decodeLanXPayload as any, systemInfoDecoder as any, systemStateDecoder as any);
	});

	it('maps system state datasets', () => {
		const state = new Uint8Array(16);

		const events = mapper.map({
			kind: 'ds.system.state',
			state
		});

		expect(events).toEqual([
			expect.objectContaining({
				event: Z21EventName.SYSTEM_STATE,
				payload: expect.objectContaining({
					raw: Array.from(state)
				})
			})
		]);
	});

	it('maps X-Bus datasets', () => {
		const command = LAN_X_COMMANDS.LAN_X_STATUS_CHANGED;

		const events = mapper.map({
			kind: 'ds.x.bus',
			xHeader: command.xHeader,
			data: Uint8Array.from([command.xBusCmd, 0x00])
		});

		expect(events[0]).toMatchObject({
			event: Z21EventName.STATUS
		});
	});

	it('maps hardware information datasets', () => {
		systemInfoDecoder.decodeHardwareInfo.mockReturnValue({
			event: Z21EventName.Z21_HWINFO,
			payload: {
				hardwareType: 'Z21_OLD',
				majorVersion: 1,
				minorVersion: 20,
				raw: [0x00000200, 0x00000120]
			}
		});

		const events = mapper.map({
			kind: 'ds.hwinfo',
			hwtype: 0x00000200,
			fwVersionBcd: 0x00000120
		});

		expect(events).toEqual([
			{
				event: Z21EventName.Z21_HWINFO,
				payload: {
					hardwareType: 'Z21_OLD',
					majorVersion: 1,
					minorVersion: 20,
					raw: [0x00000200, 0x00000120]
				}
			}
		]);

		expect(systemInfoDecoder.decodeHardwareInfo).toHaveBeenCalledWith(0x00000200, 0x00000120);
	});

	it('maps code datasets', () => {
		expect(
			mapper.map({
				kind: 'ds.code',
				code: 42
			})
		).toEqual([
			{
				event: Z21EventName.Z21_CODE,
				payload: {
					code: 42,
					raw: [42]
				}
			}
		]);
	});

	it('maps broadcast flag datasets', () => {
		systemInfoDecoder.decodeBroadcastFlags.mockReturnValue({
			event: Z21EventName.BROADCAST_FLAGS,
			payload: {
				flags: {},
				raw: [0x01, 0x00, 0x00, 0x00]
			}
		});
		const events = mapper.map({
			kind: 'ds.broadcast.flags',
			flags: 0x01
		});

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				event: Z21EventName.BROADCAST_FLAGS
			})
		]);
	});

	it.each<Z21Dataset>([
		{
			kind: 'ds.unknown',
			header: 0x1234,
			payload: Uint8Array.from([0x01]),
			reason: 'test'
		},
		{
			kind: 'ds.bad_xor',
			calc: '42',
			recv: '43'
		}
	])('returns no events for diagnostic dataset $kind', (dataset) => {
		expect(mapper.map(dataset)).toEqual([]);
	});

	it('maps serial number datasets', () => {
		expect(
			mapper.map({
				kind: 'ds.serial',
				serial: 0xdeadbeef
			})
		).toEqual([
			{
				event: Z21EventName.SERIAL,
				payload: {
					serial: 0xdeadbeef,
					raw: [0xef, 0xbe, 0xad, 0xde]
				}
			}
		]);
	});
});
