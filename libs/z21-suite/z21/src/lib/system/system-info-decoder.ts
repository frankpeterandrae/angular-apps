/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import {
	type BroadcastflagEvent,
	type Broadcastflags,
	HARDWARE_TYPE_BY_ID,
	type HardwareType,
	Z21EventName,
	type Z21HwinfoEvent
} from '@application-platform/z21-shared';

import { Z21BroadcastFlag } from '../constants';

/**
 * Decodes Z21 system information.
 */
export class SystemInfoDecoder {
	/**
	 * Decodes the Z21 broadcast flag bitmask.
	 *
	 * @param flagsValue - Broadcast flags as unsigned 32-bit value.
	 * @returns Decoded broadcast flag event.
	 */
	public decodeBroadcastFlags(flagsValue: number): BroadcastflagEvent {
		const value = flagsValue >>> 0;
		const raw = Buffer.alloc(4);

		raw.writeUInt32LE(value, 0);

		const flags: Broadcastflags = {
			none: value === Z21BroadcastFlag.NONE,
			basic: Boolean(value & Z21BroadcastFlag.BASIC),
			rMbus: Boolean(value & Z21BroadcastFlag.R_MBUS),
			railcom: Boolean(value & Z21BroadcastFlag.RAILCOM),
			systemState: Boolean(value & Z21BroadcastFlag.SYSTEM_STATE),
			changedLocoInfo: Boolean(value & Z21BroadcastFlag.CHANGED_LOCO_INFO),
			locoNetWithoutLocoAndSwitches: Boolean(value & Z21BroadcastFlag.LOCO_NET_WITHOUT_LOCO_AND_SWITCHES),
			locoNetWithLocoAndSwitches: Boolean(value & Z21BroadcastFlag.LOCO_NET_WITH_LOCO_AND_SWITCHES),
			locoNetDetector: Boolean(value & Z21BroadcastFlag.LOCO_NET_DETECTOR),
			railcomDatachanged: Boolean(value & Z21BroadcastFlag.RAILCOM_DATACHANGED)
		};

		return {
			event: Z21EventName.BROADCAST_FLAGS,
			payload: {
				flags,
				raw: Array.from(raw)
			}
		};
	}

	/**
	 * Decodes hardware type and firmware version information.
	 *
	 * @param hardwareTypeId - Numeric hardware type identifier.
	 * @param firmwareVersionBcd - Firmware version encoded as BCD.
	 * @returns Decoded hardware information event.
	 */
	public decodeHardwareInfo(hardwareTypeId: number, firmwareVersionBcd: number): Z21HwinfoEvent {
		const hardwareType = this.getHardwareType(hardwareTypeId);

		const { major, minor } = this.decodeFirmwareVersion(firmwareVersionBcd);

		return {
			event: Z21EventName.Z21_HWINFO,
			payload: {
				hardwareType,
				majorVersion: major,
				minorVersion: minor,
				raw: [hardwareTypeId, firmwareVersionBcd]
			}
		};
	}

	private getHardwareType(hardwareTypeId: number): HardwareType | 'UNKNOWN' {
		const hardwareTypes = HARDWARE_TYPE_BY_ID as Readonly<Record<number, HardwareType>>;

		return hardwareTypes[hardwareTypeId] ?? 'UNKNOWN';
	}

	private decodeFirmwareVersion(value: number): { major: number; minor: number } {
		const digits: number[] = [];

		for (let nibble = 0; nibble < 8; nibble++) {
			const digit = (value >> (nibble * 4)) & 0x0f;

			if (digit > 9) {
				return {
					major: 0,
					minor: 0
				};
			}

			digits.unshift(digit);
		}

		const version = Number.parseInt(digits.join(''), 10) || 0;

		return {
			major: Math.floor(version / 100),
			minor: version % 100
		};
	}
}
