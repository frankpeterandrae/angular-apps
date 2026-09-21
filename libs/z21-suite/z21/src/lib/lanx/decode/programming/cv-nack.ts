/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type CvNackEvent, type LanXCommandKey } from '@application-platform/z21-shared';

/**
 * Decodes LAN-X CV programming failures.
 */
export class LanXCvNackDecoder {
	/**
	 * Decodes a CV negative acknowledgement.
	 *
	 * @param command - LAN-X CV NACK command.
	 * @returns CV NACK event, or no event for unsupported commands.
	 */
	public decode(command: LanXCommandKey): CvNackEvent[] {
		if (command !== 'LAN_X_CV_NACK' && command !== 'LAN_X_CV_NACK_SC') {
			return [];
		}

		return [
			{
				event: Z21EventName.CV_NACK,
				payload: {
					shortCircuit: command === 'LAN_X_CV_NACK_SC',
					raw: []
				}
			}
		];
	}
}
