/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { TurnoutState, Z21EventName, type TurnoutInfoEvent } from '@application-platform/z21-shared';

import { LanXTurnoutInfoDecoder } from './turnout-info';

describe('LanXTurnoutInfoDecoder', () => {
	let decoder: LanXTurnoutInfoDecoder;

	beforeEach(() => {
		decoder = new LanXTurnoutInfoDecoder();
	});

	it.each([
		{
			stateByte: 0x01,
			expected: TurnoutState.STRAIGHT
		},
		{
			stateByte: 0x02,
			expected: TurnoutState.DIVERGING
		},
		{
			stateByte: 0x00,
			expected: TurnoutState.UNKNOWN
		},
		{
			stateByte: 0x03,
			expected: TurnoutState.UNKNOWN
		}
	])('decodes turnout state $stateByte', ({ stateByte, expected }) => {
		const [event] = decoder.decode(Uint8Array.from([0xc5, 0x39, stateByte]));

		expect(event.event).toBe(Z21EventName.TURNOUT_INFO);
		expect(event.payload.addr).toBe(1337);
		expect(event.payload.state).toBe(expected);
	});

	it('returns the decoded turnout event', () => {
		const payload = Uint8Array.from([0x00, 0x03, 0x01]);

		expect(decoder.decode(payload)).toEqual<TurnoutInfoEvent[]>([
			{
				event: Z21EventName.TURNOUT_INFO,
				payload: {
					addr: 3,
					state: TurnoutState.STRAIGHT,
					raw: [0x00, 0x03, 0x01]
				}
			}
		]);
	});

	it('returns no event for an incomplete payload', () => {
		expect(decoder.decode(Uint8Array.from([0x00, 0x03]))).toEqual([]);
	});
});
