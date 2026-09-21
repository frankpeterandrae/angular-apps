/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Z21Codec } from '../../../codec/codec';
import { FULL_BYTE_MASK } from '../../../constants';

/**
 * Encodes LAN-X turnout commands.
 */
export class TurnoutEncoder {
	constructor(private readonly codec: Z21Codec) {}

	/**
	 * Encodes a turnout information request.
	 */
	public getInfo(address: number): Buffer {
		const { adrMsb, adrLsb } = this.codec.encodeAccessoryAddress(address);

		return this.codec.encodeLanX('LAN_X_GET_TURNOUT_INFO', [adrMsb, adrLsb]);
	}

	/**
	 * Encodes a turnout switching command.
	 */
	public set(address: number, port: 0 | 1, activate: boolean, queue: boolean): Buffer {
		const { adrMsb, adrLsb } = this.codec.encodeAccessoryAddress(address);

		const queueFlag = queue ? 0x20 : 0;
		const activateFlag = activate ? 0x08 : 0;

		const commandByte = (0x80 | queueFlag | activateFlag | port) & FULL_BYTE_MASK;

		return this.codec.encodeLanX('LAN_X_SET_TURNOUT', [adrMsb, adrLsb, commandByte]);
	}
}
