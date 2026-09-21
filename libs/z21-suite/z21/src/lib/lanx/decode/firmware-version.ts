/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type Z21FirmwareVersionEvent } from '@application-platform/z21-shared';

/**
 * Decodes LAN-X firmware version responses.
 */
export class LanXFirmwareVersionDecoder {
	/**
	 * Decodes a firmware version payload.
	 *
	 * @param payload - LAN-X firmware version payload.
	 * @returns Decoded firmware version event.
	 */
	public decode(payload: Uint8Array): Z21FirmwareVersionEvent[] {
		if (payload.length < 3) {
			return [];
		}
		const major = this.bcdToNumber(payload[1]);
		const minor = this.bcdToNumber(payload[2]);

		return [
			{
				event: Z21EventName.FIRMWARE_VERSION,
				payload: {
					major,
					minor,
					raw: Array.from(payload)
				}
			}
		];
	}

	private bcdToNumber(value: number | undefined): number {
		if (value === undefined) {
			return 0;
		}

		return ((value >> 4) & 0x0f) * 10 + (value & 0x0f);
	}
}
