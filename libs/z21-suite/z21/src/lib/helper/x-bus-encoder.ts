/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

/**
 * Encodes a Z21 LAN frame.
 *
 * @param header - Z21 LAN header.
 * @param payload - Optional frame payload.
 * @returns Encoded frame ready for UDP transmission.
 */
export function encodeZ21LanFrame(header: number, payload?: Buffer): Buffer {
	const length = 4 + (payload?.length ?? 0);
	const buffer = Buffer.alloc(length);

	buffer.writeUInt16LE(length, 0);
	buffer.writeUInt16LE(header, 2);
	payload?.copy(buffer, 4);

	return buffer;
}
