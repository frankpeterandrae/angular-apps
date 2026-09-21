/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type Z21FirmwareVersionEvent } from '@application-platform/z21-shared';

import { LanXFirmwareVersionDecoder } from './firmware-version';

describe('LanXFirmwareVersionDecoder', () => {
	let decoder: LanXFirmwareVersionDecoder;

	beforeEach(() => {
		decoder = new LanXFirmwareVersionDecoder();
	});

	function decode(...bytes: number[]): Z21FirmwareVersionEvent {
		return decoder.decode(Uint8Array.from(bytes))[0];
	}

	it('decodes firmware version from DB1 and DB2', () => {
		const event = decode(0x0a, 0x01, 0x23, 0xdb);

		expect(event).toEqual({
			event: Z21EventName.FIRMWARE_VERSION,
			payload: {
				major: 1,
				minor: 23,
				raw: [0x0a, 0x01, 0x23, 0xdb]
			}
		});
	});

	it('decodes BCD version values', () => {
		const event = decode(0x00, 0x25, 0x42);

		expect(event.payload.major).toBe(25);
		expect(event.payload.minor).toBe(42);
	});

	it('returns no event for incomplete payload', () => {
		expect(decoder.decode(Uint8Array.from([0x0a, 0x01]))).toEqual([]);
	});

	it('supports maximum BCD values', () => {
		const event = decode(0x00, 0x99, 0x99);

		expect(event.payload.major).toBe(99);
		expect(event.payload.minor).toBe(99);
	});

	it('copies the raw payload', () => {
		const payload = Uint8Array.from([0x00, 0x01, 0x23]);

		const event = decoder.decode(payload)[0];

		payload[1] = 0xff;

		expect(event.payload.raw).toEqual([0x00, 0x01, 0x23]);
	});
});
