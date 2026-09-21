/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { XBusCmd, XHeader } from '@application-platform/z21-shared';

import { LanXCommandResolver } from './dispatch';

describe('LanXCommandResolver', () => {
	let resolver: LanXCommandResolver;

	beforeEach(() => {
		resolver = new LanXCommandResolver();
	});

	it.each([
		{
			data: [],
			expected: 'LAN_X_UNKNOWN_COMMAND'
		},
		{
			data: [0x01],
			expected: 'LAN_X_GET_TURNOUT_INFO'
		},
		{
			data: [0x01, 0x02],
			expected: 'LAN_X_TURNOUT_INFO'
		}
	] as const)('resolves TURNOUT_INFO with $data', ({ data, expected }) => {
		expect(resolver.resolve(XHeader.TURNOUT_INFO, Uint8Array.from(data))).toBe(expected);
	});

	it('resolves commands using xBusCmd', () => {
		expect(resolver.resolve(XHeader.BROADCAST, Uint8Array.from([XBusCmd.BC_TRACK_POWER_ON]))).toBe('LAN_X_BC_TRACK_POWER_ON');
	});

	it('resolves commands identified by header only', () => {
		expect(resolver.resolve(XHeader.LOCO_INFO_ANSWER, new Uint8Array())).toBe('LAN_X_LOCO_INFO');
	});

	it('returns unknown for unsupported commands', () => {
		expect(resolver.resolve(XHeader.BROADCAST, new Uint8Array())).toBe('LAN_X_UNKNOWN_COMMAND');
	});
});
