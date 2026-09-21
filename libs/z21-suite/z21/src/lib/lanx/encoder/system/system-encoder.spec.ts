/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import { Z21LanHeader } from '@application-platform/z21-shared';

import type { Z21Codec } from '../../../codec/codec';
import { Z21BroadcastFlag } from '../../../constants';

import { SystemEncoder } from './system-encoder';

describe('SystemEncoder', () => {
	let codec: DeepMocked<Z21Codec>;
	let encoder: SystemEncoder;

	beforeEach(() => {
		codec = DeepMock<Z21Codec>();
		encoder = new SystemEncoder(codec);
	});

	it.each([
		{
			method: 'getFirmwareVersion',
			command: 'LAN_X_GET_FIRMWARE_VERSION'
		},
		{
			method: 'getStatus',
			command: 'LAN_X_GET_STATUS'
		},
		{
			method: 'stop',
			command: 'LAN_X_SET_STOP'
		},
		{
			method: 'trackPowerOff',
			command: 'LAN_X_SET_TRACK_POWER_OFF'
		},
		{
			method: 'trackPowerOn',
			command: 'LAN_X_SET_TRACK_POWER_ON'
		},
		{
			method: 'getVersion',
			command: 'LAN_X_GET_VERSION'
		}
	] as const)('$method encodes $command', ({ method, command }) => {
		const expected = Buffer.from([0x01]);
		codec.encodeLanX.mockReturnValue(expected);

		const result = encoder[method]();

		expect(codec.encodeLanX).toHaveBeenCalledWith(command);
		expect(result).toBe(expected);
	});

	describe('direct LAN commands', () => {
		it.each([
			['getHardwareInfo', Z21LanHeader.LAN_GET_HWINFO],
			['getCode', Z21LanHeader.LAN_GET_CODE],
			['getBroadcastFlags', Z21LanHeader.LAN_GET_BROADCASTFLAGS],
			['getSystemState', Z21LanHeader.LAN_SYSTEMSTATE_GETDATA],
			['logOff', Z21LanHeader.LAN_LOGOFF]
		] as const)('%s encodes header %#x', (method, header) => {
			const buffer = encoder[method]();

			expect(buffer.length).toBe(4);
			expect(buffer.readUInt16LE(0)).toBe(4);
			expect(buffer.readUInt16LE(2)).toBe(header);
		});

		it('encodes broadcast flags as a four-byte payload', () => {
			const flags = Z21BroadcastFlag.LOCO_NET_WITH_LOCO_AND_SWITCHES;
			const buffer = encoder.setBroadcastFlags(flags);

			expect(buffer.length).toBe(8);
			expect(buffer.readUInt16LE(0)).toBe(8);
			expect(buffer.readUInt16LE(2)).toBe(Z21LanHeader.LAN_SET_BROADCASTFLAGS);
			expect(buffer.readUInt32LE(4)).toBe(flags);
		});
	});
});
