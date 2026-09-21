/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type TrackPowerEvent } from '@application-platform/z21-shared';

import { LanXTrackPowerDecoder } from './track-power';

describe('LanXTrackPowerDecoder', () => {
	let decoder: LanXTrackPowerDecoder;

	beforeEach(() => {
		decoder = new LanXTrackPowerDecoder();
	});

	it.each([
		{
			command: 'LAN_X_BC_TRACK_POWER_OFF',
			powerOn: false,
			programmingMode: false,
			shortCircuit: false
		},
		{
			command: 'LAN_X_BC_TRACK_POWER_ON',
			powerOn: true,
			programmingMode: false,
			shortCircuit: false
		},
		{
			command: 'LAN_X_BC_PROGRAMMING_MODE',
			powerOn: true,
			programmingMode: true,
			shortCircuit: false
		},
		{
			command: 'LAN_X_BC_TRACK_SHORT_CIRCUIT',
			powerOn: false,
			programmingMode: false,
			shortCircuit: true
		}
	] as const)('decodes $command', ({ command, powerOn, programmingMode, shortCircuit }) => {
		const [event] = decoder.decode(command);

		expect(event.event).toBe(Z21EventName.TRACK_POWER);
		expect(event.payload).toMatchObject({
			powerOn,
			emergencyStop: false,
			programmingMode,
			shortCircuit
		});
	});

	it('returns the command as raw data', () => {
		const command = 'LAN_X_BC_TRACK_POWER_ON' as const;

		const [event] = decoder.decode(command);

		expect(event).toEqual<TrackPowerEvent>(
			expect.objectContaining({
				event: Z21EventName.TRACK_POWER,
				payload: expect.objectContaining({
					raw: Array.from(Buffer.from(command, 'ascii'))
				})
			})
		);
	});
});
