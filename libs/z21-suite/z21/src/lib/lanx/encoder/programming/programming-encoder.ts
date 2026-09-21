/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Z21Codec } from '../../../codec/codec';
import { FULL_BYTE_MASK } from '../../../constants';

/**
 * Encodes LAN-X programming commands.
 */
export class ProgrammingEncoder {
	constructor(private readonly codec: Z21Codec) {}

	/**
	 * Encodes a service-mode CV read command.
	 */
	public readCv(cvAddress: number): Buffer {
		this.validateCvAddress(cvAddress);

		const { adrMsb, adrLsb } = this.codec.encodeCvAddress(cvAddress);

		return this.codec.encodeLanX('LAN_X_CV_READ', [adrMsb, adrLsb]);
	}

	/**
	 * Encodes a service-mode CV write command.
	 */
	public writeCv(cvAddress: number, cvValue: number): Buffer {
		this.validateCvAddress(cvAddress);
		this.validateCvValue(cvValue);

		const { adrMsb, adrLsb } = this.codec.encodeCvAddress(cvAddress);

		return this.codec.encodeLanX('LAN_X_CV_WRITE', [adrMsb, adrLsb, cvValue & FULL_BYTE_MASK]);
	}

	/**
	 * Encodes a POM CV read payload.
	 */
	public readPomCv(cvAddress: number): Uint8Array {
		this.validateCvAddress(cvAddress);

		const address = cvAddress - 1;

		return Uint8Array.from([address & FULL_BYTE_MASK, (address >> 8) & FULL_BYTE_MASK]);
	}

	/**
	 * Encodes a POM CV write payload.
	 */
	public writePomCv(cvAddress: number, cvValue: number): Uint8Array {
		this.validateCvAddress(cvAddress);
		this.validateCvValue(cvValue);

		const address = cvAddress - 1;

		return Uint8Array.from([address & FULL_BYTE_MASK, (address >> 8) & FULL_BYTE_MASK, cvValue & FULL_BYTE_MASK]);
	}

	private validateCvAddress(cvAddress: number): void {
		if (cvAddress < 1 || cvAddress > 1024) {
			throw new Error(`CV address (${cvAddress}) out of range (1..1024)`);
		}
	}

	private validateCvValue(cvValue: number): void {
		if (cvValue < 0 || cvValue > 255) {
			throw new Error(`CV value (${cvValue}) out of range (0..255)`);
		}
	}
}
