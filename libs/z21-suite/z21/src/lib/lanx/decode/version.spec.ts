/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type Z21VersionEvent } from '@application-platform/z21-shared';

import { LanXVersionDecoder } from './version';

describe('LanXVersionDecoder', () => {
	let decoder: LanXVersionDecoder;

	beforeEach(() => {
		decoder = new LanXVersionDecoder();
	});

	it.each([
		{ encoded: 0x30, expected: 'V3.0' },
		{ encoded: 0x36, expected: 'V3.6' },
		{ encoded: 0x40, expected: 'V4.0' },
		{ encoded: 0x89, expected: 'V8.9' },
		{ encoded: 0x00, expected: 'Unknown' }
	])('formats X-Bus version $encoded as $expected', ({ encoded, expected }) => {
		const [event] = decoder.decode(Uint8Array.from([encoded, 0x12]));

		expect(event.payload.xBusVersionString).toBe(expected);
	});

	it('decodes version and command station identifier', () => {
		const payload = Uint8Array.from([0x36, 0x12]);

		expect(decoder.decode(payload)).toEqual<Z21VersionEvent[]>([
			{
				event: Z21EventName.X_BUS_VERSION,
				payload: {
					xBusVersion: 0x36,
					xBusVersionString: 'V3.6',
					cmdsId: 0x12,
					raw: [0x36, 0x12]
				}
			}
		]);
	});

	it('returns no event for an incomplete payload', () => {
		expect(decoder.decode(Uint8Array.from([0x36]))).toEqual([]);
	});
});
