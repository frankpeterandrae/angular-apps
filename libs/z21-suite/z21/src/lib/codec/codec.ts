/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { LAN_X_COMMANDS, Z21LanHeader, type LanXCommandKey } from '@application-platform/z21-shared';

import { AddressByteMask, FULL_BYTE_MASK } from '../constants';

import type { Z21Dataset } from './codec-types';

type ByteLike = ReadonlyArray<number> | Uint8Array;

/**
 * Z21Codec is a utility class for encoding and decoding Z21 protocol messages.
 */
export class Z21Codec {
	/**
	 * Parses one or more concatenated Z21 frames from a UDP datagram.
	 *
	 * Malformed or unsupported frames are represented as diagnostic datasets
	 * where possible. Parsing stops when a frame declares an invalid or truncated
	 * length.
	 *
	 * @param buffer - UDP datagram containing Z21 frames.
	 * @returns Decoded datasets in frame order.
	 */
	public parseZ21Datagram(buffer: Buffer): Z21Dataset[] {
		const out: Z21Dataset[] = [];
		let offset = 0;

		while (offset + 4 <= buffer.length) {
			const len = buffer.readUint16LE(offset);
			if (len < 4 || offset + len > buffer.length) {
				// Invalid or truncated frame: stop parsing to avoid reading past end.
				break;
			}

			const header = buffer.readUint16LE(offset + 2);
			const payload = buffer.subarray(offset + 4, offset + len);

			// Delegate per-header parsing to small helpers to keep this loop simple.
			switch (header) {
				case Z21LanHeader.LAN_X:
					this.handleXBus(payload, out);
					break;
				case Z21LanHeader.LAN_SYSTEMSTATE_DATACHANGED:
					this.handleSystemState(payload, out);
					break;
				case Z21LanHeader.LAN_GET_HWINFO:
					this.handleHwInfo(payload, out);
					break;
				case Z21LanHeader.LAN_GET_CODE:
					this.handleCode(payload, out);
					break;
				case Z21LanHeader.LAN_GET_BROADCASTFLAGS:
					this.handleBroadcastFlags(payload, out);
					break;
				case Z21LanHeader.LAN_GET_SERIAL_NUMBER:
					this.handleSerial(payload, out);
					break;
				default:
					out.push({ kind: 'ds.unknown', header, payload, reason: 'unrecognized header or invalid payload length' });
			}

			offset += len;
		}

		return out;
	}

	private handleXBus(payload: Buffer, out: Z21Dataset[]): void {
		if (payload.length < 2) {
			out.push({ kind: 'ds.unknown', header: Z21LanHeader.LAN_X, payload, reason: 'x-bus payload too short' });
			return;
		}

		const xHeader = payload[0];
		const bodyNoXor = payload.subarray(0, -1);
		const xorByte = payload.at(-1) as number;
		const db = bodyNoXor.subarray(1);

		const calc = this.xbusXor(bodyNoXor);
		if (calc !== xorByte) {
			out.push({ kind: 'ds.bad_xor', calc: calc.toString(16), recv: xorByte.toString(16) });
		}

		out.push({ kind: 'ds.x.bus', xHeader, data: Uint8Array.from(db) });
	}

	private handleSystemState(payload: Buffer, out: Z21Dataset[]): void {
		if (payload.length !== 16) {
			out.push({
				kind: 'ds.unknown',
				header: Z21LanHeader.LAN_SYSTEMSTATE_DATACHANGED,
				payload,
				reason: 'unrecognized header or invalid payload length'
			});
			return;
		}
		out.push({ kind: 'ds.system.state', state: Uint8Array.from(payload) });
	}

	private handleHwInfo(payload: Buffer, out: Z21Dataset[]): void {
		if (payload.length !== 8) {
			out.push({
				kind: 'ds.unknown',
				header: Z21LanHeader.LAN_GET_HWINFO,
				payload,
				reason: 'unrecognized header or invalid payload length'
			});
			return;
		}
		const hwtype = payload.readUint32LE(0);
		const fwVersionBcd = payload.readUint32LE(4);
		out.push({ kind: 'ds.hwinfo', hwtype, fwVersionBcd });
	}

	private handleCode(payload: Buffer, out: Z21Dataset[]): void {
		if (payload.length !== 1) {
			out.push({
				kind: 'ds.unknown',
				header: Z21LanHeader.LAN_GET_CODE,
				payload,
				reason: 'unrecognized header or invalid payload length'
			});
			return;
		}
		out.push({ kind: 'ds.code', code: payload[0] });
	}

	private handleBroadcastFlags(payload: Buffer, out: Z21Dataset[]): void {
		if (payload.length !== 4) {
			out.push({
				kind: 'ds.unknown',
				header: Z21LanHeader.LAN_GET_BROADCASTFLAGS,
				payload,
				reason: 'unrecognized header or invalid payload length'
			});
			return;
		}
		const flags = payload.readUint32LE(0);
		out.push({ kind: 'ds.broadcast.flags', flags });
	}

	private handleSerial(payload: Buffer, out: Z21Dataset[]): void {
		if (payload.length !== 4) {
			out.push({
				kind: 'ds.unknown',
				header: Z21LanHeader.LAN_GET_SERIAL_NUMBER,
				payload,
				reason: 'unrecognized header or invalid payload length'
			});

			return;
		}

		out.push({
			kind: 'ds.serial',
			serial: payload.readUint32LE(0)
		});
	}

	/**
	 * Calculates the X-BUS XOR checksum for the supplied bytes.
	 *
	 * @param bytes - Bytes included in the checksum.
	 * @returns Checksum value in the range 0–255.
	 */
	public xbusXor(bytes: ByteLike): number {
		let acc = 0;
		for (const b of bytes) {
			acc ^= b & FULL_BYTE_MASK;
		}

		return acc & FULL_BYTE_MASK;
	}

	/**
	 * Encodes a message in LAN_X format for Z21 communication.
	 * Wraps X-BUS protocol data with LAN headers, length field, and XOR checksum.
	 *
	 * Message structure:
	 * - Bytes 0-1: DataLen (little-endian, includes the length field itself)
	 * - Bytes 2-3: Header (0x0040 for LAN_X)
	 * - Bytes 4..n: X-BUS payload
	 * - Byte n+1: XOR checksum
	 *
	 * @param xLanCommand - The LAN_X command key to encode
	 * @param xbus - X-BUS protocol bytes (additional data after header and command)
	 * @returns Buffer containing the complete LAN_X encoded message
	 */
	public encodeLanX(xLanCommand: LanXCommandKey, xbus: readonly number[] = []): Buffer {
		const command = LAN_X_COMMANDS[xLanCommand];
		const xHeader = command.xHeader;

		const fullXbus = this.hasXbusCmd(command) ? [xHeader, command.xBusCmd, ...xbus] : [xHeader, ...xbus];

		const xor = this.xbusXor(fullXbus);
		const len = 2 + 2 + fullXbus.length + 1;
		const buffer = Buffer.alloc(len);
		buffer.writeUInt16LE(len, 0);
		buffer.writeUInt16LE(Z21LanHeader.LAN_X, 2);
		for (let i = 0; i < fullXbus.length; i++) {
			buffer[4 + i] = fullXbus[i];
		}
		buffer[4 + fullXbus.length] = xor;
		return buffer;
	}

	/**
	 * Encode a locomotive address into the two address bytes used by X-BUS.
	 *
	 * Address encoding rules:
	 * - Valid addresses: 1..9999 (throws otherwise)
	 * - adrMsb: top bits are the high address bits masked and, for large addresses (>=128),
	 *   the 0xc0 prefix is applied to indicate a long address, then masked to a single byte.
	 * - adrLsb: low 8 bits of the address.
	 *
	 * This routine keeps masking operations explicit to ensure only the intended bits are set.
	 *
	 * @param address - Numeric loco address (1..9999)
	 * @throws Error if address is not in the allowed 1..9999 range.
	 * @returns Object with `adrMsb` and `adrLsb` bytes (both 0..255).
	 */
	public encodeLocoAddress(address: number): { adrMsb: number; adrLsb: number } {
		if (address < 1 || address > 9999) {
			throw new Error(`Address (${address}) out of range (1..9999)`);
		}

		const adrMsb = (address >> 8) & AddressByteMask.MSB;
		const adrLsb = address & FULL_BYTE_MASK;

		return address >= 128 ? { adrMsb: (0xc0 | adrMsb) & FULL_BYTE_MASK, adrLsb } : { adrMsb, adrLsb };
	}

	private hasXbusCmd(command: unknown): command is { xBusCmd: number } {
		if (typeof command !== 'object' || command === null) return false;
		// Use hasOwnProperty to avoid issues with prototype keys
		const has = Object.hasOwn(command, 'xBusCmd');
		return has && typeof (command as { xBusCmd?: unknown }).xBusCmd === 'number';
	}

	/**
	 * Encode an accessory (turnout) address into the two address bytes used by X-BUS.
	 *
	 * @param address - Accessory address (0..16383)
	 * @throws Error if address is not in the allowed 0..16383 range.
	 * @returns Object with `adrMsb` and `adrLsb` bytes (both 0..255).
	 */
	public encodeAccessoryAddress(address: number): { adrMsb: number; adrLsb: number } {
		if (address < 0 || address > 16383) {
			throw new Error(`Accessory address (${address}) out of range (0..16383)`);
		}

		const adrMsb = (address >> 8) & FULL_BYTE_MASK;
		const adrLsb = address & FULL_BYTE_MASK;

		return { adrMsb, adrLsb };
	}

	/**
	 * Encodes a one-based CV address into the two protocol address bytes.
	 *
	 * @param address - CV address in the range 1–16383.
	 * @throws Error if the address is outside the supported range.
	 * @returns Zero-based CV address split into MSB and LSB.
	 */
	public encodeCvAddress(address: number): { adrMsb: number; adrLsb: number } {
		if (address < 1 || address > 16383) {
			throw new Error(`CV address (${address}) out of range`);
		}
		const correctedAddress = address - 1; // CV addresses are 1-based, adjust to 0-based
		const adrMsb = (correctedAddress >> 8) & FULL_BYTE_MASK;
		const adrLsb = correctedAddress & FULL_BYTE_MASK;

		return { adrMsb, adrLsb };
	}
}
