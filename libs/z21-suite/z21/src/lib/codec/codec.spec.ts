/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { LAN_X_COMMANDS, Z21LanHeader } from '@application-platform/z21-shared';
import { beforeEach, describe, expect, it } from 'vitest';

import { FULL_BYTE_MASK } from '../constants';

import { Z21Codec } from './codec';

describe('Z21Codec', () => {
	let decoder: Z21Codec;

	function makeFrame(header: number, payload: number[]): Buffer {
		const length = payload.length + 4;
		const buffer = Buffer.alloc(length);

		buffer.writeUint16LE(length, 0);
		buffer.writeUint16LE(header, 2);
		Buffer.from(payload).copy(buffer, 4);

		return buffer;
	}

	function makeXBusPayload(payload: number[]): number[] {
		return [...payload, decoder.xbusXor(payload)];
	}

	function makeXBusPayloadWithBadXor(payload: number[]): number[] {
		return [...payload, (decoder.xbusXor(payload) + 1) & FULL_BYTE_MASK];
	}

	function makeSystemStatePayload(): number[] {
		return Array.from({ length: 16 }, (_, index) => index);
	}

	function makeHardwareInfoPayload(hardwareType: number, firmwareVersionBcd: number): number[] {
		const buffer = Buffer.alloc(8);

		buffer.writeUint32LE(hardwareType, 0);
		buffer.writeUint32LE(firmwareVersionBcd, 4);

		return Array.from(buffer);
	}

	beforeEach(() => {
		decoder = new Z21Codec();
	});

	describe('X-Bus frames', () => {
		it('parses an X-Bus frame and removes the checksum', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_X, makeXBusPayload([0x10, 0x01, 0x02]));

			const result = decoder.parseZ21Datagram(buffer);

			expect(result).toEqual([
				{
					kind: 'ds.x.bus',
					xHeader: 0x10,
					data: Uint8Array.from([0x01, 0x02])
				}
			]);
		});

		it('reports a checksum mismatch and still returns the X-Bus dataset', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_X, makeXBusPayloadWithBadXor([0x21, 0x02, 0x03]));

			const result = decoder.parseZ21Datagram(buffer);

			expect(result).toEqual([
				expect.objectContaining({
					kind: 'ds.bad_xor',
					calc: expect.any(String),
					recv: expect.any(String)
				}),
				{
					kind: 'ds.x.bus',
					xHeader: 0x21,
					data: Uint8Array.from([0x02, 0x03])
				}
			]);
		});

		it('supports an X-Bus frame without data bytes', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_X, makeXBusPayload([0x62]));

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				{
					kind: 'ds.x.bus',
					xHeader: 0x62,
					data: Uint8Array.from([])
				}
			]);
		});

		it('returns an unknown dataset for a too-short X-Bus payload', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_X, []);

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				expect.objectContaining({
					kind: 'ds.unknown',
					reason: 'x-bus payload too short'
				})
			]);
		});
	});

	describe('system state frames', () => {
		it('parses a 16-byte system state payload', () => {
			const payload = makeSystemStatePayload();
			const buffer = makeFrame(Z21LanHeader.LAN_SYSTEMSTATE_DATACHANGED, payload);

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				{
					kind: 'ds.system.state',
					state: Uint8Array.from(payload)
				}
			]);
		});

		it('returns an unknown dataset for an invalid payload length', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_SYSTEMSTATE_DATACHANGED, [0x01, 0x02, 0x03]);

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				expect.objectContaining({
					kind: 'ds.unknown',
					reason: 'unrecognized header or invalid payload length'
				})
			]);
		});
	});

	describe('hardware information frames', () => {
		it('parses hardware type and firmware version', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_GET_HWINFO, makeHardwareInfoPayload(0x00000201, 0x01230000));

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				{
					kind: 'ds.hwinfo',
					hwtype: 0x00000201,
					fwVersionBcd: 0x01230000
				}
			]);
		});

		it('returns an unknown dataset for an invalid payload length', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_GET_HWINFO, [0x01, 0x02]);

			expect(decoder.parseZ21Datagram(buffer)[0]).toMatchObject({
				kind: 'ds.unknown'
			});
		});
	});

	describe('code frames', () => {
		it('parses the Z21 code', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_GET_CODE, [0x42]);

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				{
					kind: 'ds.code',
					code: 0x42
				}
			]);
		});

		it('returns an unknown dataset for an invalid payload length', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_GET_CODE, [0x01, 0x02]);

			expect(decoder.parseZ21Datagram(buffer)[0]).toMatchObject({
				kind: 'ds.unknown'
			});
		});
	});

	describe('broadcast flag frames', () => {
		it('parses broadcast flags', () => {
			const payload = Buffer.alloc(4);
			payload.writeUInt32LE(0xaabbccdd, 0);

			const buffer = makeFrame(Z21LanHeader.LAN_GET_BROADCASTFLAGS, Array.from(payload));

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				{
					kind: 'ds.broadcast.flags',
					flags: 0xaabbccdd
				}
			]);
		});

		it('returns an unknown dataset for an invalid payload length', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_GET_BROADCASTFLAGS, [0x01, 0x02, 0x03]);

			expect(decoder.parseZ21Datagram(buffer)[0]).toMatchObject({
				kind: 'ds.unknown'
			});
		});
	});

	describe('malformed frames', () => {
		it('returns an unknown dataset for an unsupported header', () => {
			const buffer = makeFrame(0x9999, [0x01, 0x02]);

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				expect.objectContaining({
					kind: 'ds.unknown'
				})
			]);
		});

		it('returns no datasets for an empty buffer', () => {
			expect(decoder.parseZ21Datagram(Buffer.alloc(0))).toEqual([]);
		});

		it('returns no datasets when the buffer is shorter than a frame header', () => {
			expect(decoder.parseZ21Datagram(Buffer.from([0x04, 0x00]))).toEqual([]);
		});

		it('stops parsing when the declared frame length is below the minimum', () => {
			expect(decoder.parseZ21Datagram(Buffer.from([0x03, 0x00, 0x40, 0x00]))).toEqual([]);
		});

		it('stops parsing when a frame extends beyond the datagram', () => {
			expect(decoder.parseZ21Datagram(Buffer.from([0x08, 0x00, 0x40, 0x00, 0x01]))).toEqual([]);
		});
	});

	describe('multiple frames', () => {
		it('parses concatenated frames in order', () => {
			const firstFrame = makeFrame(Z21LanHeader.LAN_X, makeXBusPayload([0x10, 0x01]));
			const secondFrame = makeFrame(Z21LanHeader.LAN_GET_CODE, [0x42]);
			const thirdFrame = makeFrame(Z21LanHeader.LAN_SYSTEMSTATE_DATACHANGED, makeSystemStatePayload());

			const result = decoder.parseZ21Datagram(Buffer.concat([firstFrame, secondFrame, thirdFrame]));

			expect(result).toHaveLength(3);
			expect(result[0]).toMatchObject({
				kind: 'ds.x.bus'
			});
			expect(result[1]).toEqual({
				kind: 'ds.code',
				code: 0x42
			});
			expect(result[2]).toMatchObject({
				kind: 'ds.system.state'
			});
		});
	});

	describe('serial number frames', () => {
		it('parses the Z21 serial number', () => {
			const payload = Buffer.alloc(4);
			payload.writeUInt32LE(0xdeadbeef, 0);

			const buffer = makeFrame(Z21LanHeader.LAN_GET_SERIAL_NUMBER, Array.from(payload));

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				{
					kind: 'ds.serial',
					serial: 0xdeadbeef
				}
			]);
		});

		it('returns an unknown dataset for an invalid payload length', () => {
			const buffer = makeFrame(Z21LanHeader.LAN_GET_SERIAL_NUMBER, [0x01, 0x02, 0x03]);

			expect(decoder.parseZ21Datagram(buffer)).toEqual([
				expect.objectContaining({
					kind: 'ds.unknown',
					header: Z21LanHeader.LAN_GET_SERIAL_NUMBER
				})
			]);
		});
	});

	describe('encodeLanX', () => {
		it('encodes a LAN-X command with X-Bus command byte', () => {
			const command = LAN_X_COMMANDS.LAN_X_GET_STATUS;

			const buffer = decoder.encodeLanX('LAN_X_GET_STATUS', [0x12, 0x34]);

			expect(buffer.readUInt16LE(0)).toBe(buffer.length);
			expect(buffer.readUInt16LE(2)).toBe(Z21LanHeader.LAN_X);

			expect(buffer[4]).toBe(command.xHeader);
			expect(buffer[5]).toBe(command.xBusCmd);
			expect(buffer[6]).toBe(0x12);
			expect(buffer[7]).toBe(0x34);

			expect(buffer.at(-1)).toBe(decoder.xbusXor([command.xHeader, command.xBusCmd, 0x12, 0x34]));
		});

		it('encodes a LAN-X command without X-Bus command byte', () => {
			const command = LAN_X_COMMANDS.LAN_X_SET_STOP;

			const buffer = decoder.encodeLanX('LAN_X_SET_STOP');

			expect(buffer.readUInt16LE(0)).toBe(buffer.length);
			expect(buffer.readUInt16LE(2)).toBe(Z21LanHeader.LAN_X);

			expect(buffer[4]).toBe(command.xHeader);
			expect(buffer.at(-1)).toBe(decoder.xbusXor([command.xHeader]));
		});
	});

	describe('encodeLocoAddress', () => {
		it.each([
			[1, { adrMsb: 0x00, adrLsb: 0x01 }],
			[127, { adrMsb: 0x00, adrLsb: 0x7f }],
			[128, { adrMsb: 0xc0, adrLsb: 0x80 }],
			[255, { adrMsb: 0xc0, adrLsb: 0xff }],
			[256, { adrMsb: 0xc1, adrLsb: 0x00 }],
			[9999, { adrMsb: 0xe7, adrLsb: 0x0f }]
		])('encodes locomotive address %i', (address, expected) => {
			expect(decoder.encodeLocoAddress(address)).toEqual(expected);
		});

		it.each([0, -1, 10_000])('rejects locomotive address %i', (address) => {
			expect(() => decoder.encodeLocoAddress(address)).toThrow(`Address (${address}) out of range (1..9999)`);
		});
	});

	describe('encodeAccessoryAddress', () => {
		it.each([
			[0, { adrMsb: 0x00, adrLsb: 0x00 }],
			[1, { adrMsb: 0x00, adrLsb: 0x01 }],
			[255, { adrMsb: 0x00, adrLsb: 0xff }],
			[256, { adrMsb: 0x01, adrLsb: 0x00 }],
			[16_383, { adrMsb: 0x3f, adrLsb: 0xff }]
		])('encodes accessory address %i', (address, expected) => {
			expect(decoder.encodeAccessoryAddress(address)).toEqual(expected);
		});

		it.each([-1, 16_384])('rejects accessory address %i', (address) => {
			expect(() => decoder.encodeAccessoryAddress(address)).toThrow(`Accessory address (${address}) out of range (0..16383)`);
		});
	});

	describe('encodeCvAddress', () => {
		it.each([
			[1, { adrMsb: 0x00, adrLsb: 0x00 }],
			[2, { adrMsb: 0x00, adrLsb: 0x01 }],
			[256, { adrMsb: 0x00, adrLsb: 0xff }],
			[257, { adrMsb: 0x01, adrLsb: 0x00 }],
			[16_383, { adrMsb: 0x3f, adrLsb: 0xfe }]
		])('encodes CV address %i', (address, expected) => {
			expect(decoder.encodeCvAddress(address)).toEqual(expected);
		});

		it.each([0, -1, 16_384])('rejects CV address %i', (address) => {
			expect(() => decoder.encodeCvAddress(address)).toThrow(`CV address (${address}) out of range`);
		});
	});
});
