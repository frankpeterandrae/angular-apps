/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Direction } from '@application-platform/z21-shared';

import type { Z21Codec } from '../../../codec/codec';
import { type LocoFunctionSwitchType, SpeedByteMask } from '../../../constants';

/**
 * Encodes LAN-X locomotive commands.
 */
export class LocoEncoder {
	constructor(private readonly codec: Z21Codec) {}

	/**
	 * Encodes a locomotive drive command in 128-step mode.
	 *
	 * Regular speed steps range from 0 to 126.
	 * Encoded value 0 represents stop and value 1 is reserved for emergency stop.
	 *
	 * @param address - Locomotive address.
	 * @param speedStep - Regular speed step from 0 to 126.
	 * @param direction - Direction of travel.
	 * @returns Complete LAN-X frame.
	 */
	public drive(address: number, speedStep: number, direction: Direction): Buffer {
		if (speedStep < 0 || speedStep > 126) {
			throw new Error(`Speed step (${speedStep}) out of range (0..126)`);
		}

		const speedCode = speedStep === 0 ? 0 : speedStep + 1;

		const directionSpeed = this.encodeDirectionSpeed(direction, speedCode);

		const { adrMsb, adrLsb } = this.codec.encodeLocoAddress(address);

		return this.codec.encodeLanX('LAN_X_SET_LOCO_DRIVE_128', [adrMsb, adrLsb, directionSpeed]);
	}

	/**
	 * Encodes an emergency-stop command for one locomotive.
	 */
	public emergencyStop(address: number): Buffer {
		const { adrMsb, adrLsb } = this.codec.encodeLocoAddress(address);

		return this.codec.encodeLanX('LAN_X_SET_LOCO_E_STOP', [adrMsb, adrLsb]);
	}

	/**
	 * Encodes a locomotive function command.
	 */
	public setFunction(address: number, functionNumber: number, type: LocoFunctionSwitchType): Buffer {
		if (functionNumber < 0 || functionNumber > 31) {
			throw new Error(`Function number (${functionNumber}) out of range (0..31)`);
		}

		const { adrMsb, adrLsb } = this.codec.encodeLocoAddress(address);

		const functionByte = ((type & 0b11) << 6) | (functionNumber & 0x3f);

		return this.codec.encodeLanX('LAN_X_SET_LOCO_FUNCTION', [adrMsb, adrLsb, functionByte]);
	}

	/**
	 * Encodes a locomotive information request.
	 */
	public getInfo(address: number): Buffer {
		const { adrMsb, adrLsb } = this.codec.encodeLocoAddress(address);

		return this.codec.encodeLanX('LAN_X_GET_LOCO_INFO', [adrMsb, adrLsb]);
	}

	private encodeDirectionSpeed(direction: Direction, speedCode: number): number {
		const directionBit = direction === Direction.FWD ? SpeedByteMask.DIRECTION_FORWARD : SpeedByteMask.DIRECTION_REVERSE;

		return directionBit | (speedCode & SpeedByteMask.VALUE);
	}
}
