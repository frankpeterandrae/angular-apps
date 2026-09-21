/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CentralStatus, Z21EventName, type Z21StatusEvent } from '@application-platform/z21-shared';

/**
 * Decodes LAN-X central station status payloads.
 */
export class LanXStatusDecoder {
	/**
	 * Decodes the central station status flags.
	 *
	 * @param payload - LAN-X status payload.
	 * @returns Decoded status event, or no event for incomplete data.
	 */
	public decode(payload: Uint8Array): Z21StatusEvent[] {
		if (payload.length < 2) {
			return [];
		}

		const status = payload[1];

		return [
			{
				event: Z21EventName.STATUS,
				payload: {
					emergencyStop: (status & CentralStatus.EmergencyStop) !== 0,
					shortCircuit: (status & CentralStatus.ShortCircuit) !== 0,
					powerOn: (status & CentralStatus.TrackVoltageOff) === 0,
					programmingMode: (status & CentralStatus.ProgrammingModeActive) !== 0,
					raw: Array.from(payload)
				}
			}
		];
	}
}
