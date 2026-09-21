/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type Z21VersionEvent } from '@application-platform/z21-shared';

/**
 * Decodes LAN-X X-Bus version payloads.
 */
export class LanXVersionDecoder {
	/**
	 * Decodes X-Bus version and command station identifier.
	 *
	 * @param payload - LAN-X version payload.
	 * @returns Decoded version event, or no event for incomplete data.
	 */
	public decode(payload: Uint8Array): Z21VersionEvent[] {
		if (payload.length < 2) {
			return [];
		}

		const xBusVersion = payload[0];

		return [
			{
				event: Z21EventName.X_BUS_VERSION,
				payload: {
					xBusVersion,
					xBusVersionString: this.formatVersion(xBusVersion),
					cmdsId: payload[1],
					raw: Array.from(payload)
				}
			}
		];
	}

	private formatVersion(version: number): string {
		const major = (version >> 4) & 0x0f;
		const minor = version & 0x0f;

		return major === 0 && minor === 0 ? 'Unknown' : `V${major}.${minor}`;
	}
}
