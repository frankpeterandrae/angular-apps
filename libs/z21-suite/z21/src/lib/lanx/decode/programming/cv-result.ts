/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type CvResultEvent } from '@application-platform/z21-shared';

import { decodeCvAddress } from '../_shared';

/**
 * Decodes LAN-X CV programming results.
 */
export class LanXCvResultDecoder {
	/**
	 * Decodes CV address and value from a programming result.
	 *
	 * @param payload - LAN-X CV result payload.
	 * @returns CV result event, or no event for incomplete data.
	 */
	public decode(payload: Uint8Array): CvResultEvent[] {
		if (payload.length < 4) {
			return [];
		}

		return [
			{
				event: Z21EventName.CV_RESULT,
				payload: {
					cv: decodeCvAddress(payload[1], payload[2]),
					value: payload[3],
					raw: Array.from(payload)
				}
			}
		];
	}
}
