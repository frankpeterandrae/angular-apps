/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21LanHeader } from '@application-platform/z21-shared';

import { encodeZ21LanFrame } from './x-bus-encoder';

describe('encodeZ21LanFrame', () => {
	it('encodes a frame without payload', () => {
		const buffer = encodeZ21LanFrame(Z21LanHeader.LAN_GET_SERIAL_NUMBER);

		expect(buffer).toEqual(Buffer.from([0x04, 0x00, 0x10, 0x00]));
	});

	it('encodes header and payload', () => {
		const buffer = encodeZ21LanFrame(Z21LanHeader.LAN_SET_BROADCASTFLAGS, Buffer.from([0x01, 0x02, 0x03]));

		expect(buffer.readUInt16LE(0)).toBe(7);
		expect(buffer.readUInt16LE(2)).toBe(Z21LanHeader.LAN_SET_BROADCASTFLAGS);
		expect(buffer.subarray(4)).toEqual(Buffer.from([0x01, 0x02, 0x03]));
	});

	it('treats an empty payload like no payload', () => {
		expect(encodeZ21LanFrame(Z21LanHeader.LAN_GET_SERIAL_NUMBER, Buffer.alloc(0))).toEqual(
			encodeZ21LanFrame(Z21LanHeader.LAN_GET_SERIAL_NUMBER)
		);
	});
});
