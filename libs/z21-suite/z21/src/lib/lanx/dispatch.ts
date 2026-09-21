/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { LAN_X_COMMANDS, XHeader, type LanXCommandKey } from '@application-platform/z21-shared';

/**
 * Resolves LAN-X command identifiers from decoded X-Bus data.
 */
export class LanXCommandResolver {
	/**
	 * Resolves the LAN-X command represented by the supplied header and data.
	 *
	 * @param xHeader - X-Bus header.
	 * @param data - X-Bus data bytes following the header.
	 * @returns Matching command key or `LAN_X_UNKNOWN_COMMAND`.
	 */
	public resolve(xHeader: number, data: Uint8Array): LanXCommandKey {
		const xBusCmd = data[0];

		if (xHeader === XHeader.TURNOUT_INFO) {
			if (data.length === 0) {
				return 'LAN_X_UNKNOWN_COMMAND';
			}

			return data.length === 1 ? 'LAN_X_GET_TURNOUT_INFO' : 'LAN_X_TURNOUT_INFO';
		}

		for (const [key, command] of Object.entries(LAN_X_COMMANDS)) {
			if (command.xHeader !== xHeader) {
				continue;
			}

			if (!('xBusCmd' in command) || xBusCmd === command.xBusCmd) {
				return key as LanXCommandKey;
			}
		}

		return 'LAN_X_UNKNOWN_COMMAND';
	}
}
