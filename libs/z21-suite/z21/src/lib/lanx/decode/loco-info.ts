/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type LocoInfoEvent } from '@application-platform/z21-shared';

import { decodeDccAddress, decodeFunctions, decodeSpeed } from './_shared';

/**
 * Decodes LAN-X locomotive information payloads.
 */
export class LanXLocoInfoDecoder {
	/**
	 * Decodes locomotive state and function information.
	 *
	 * @param payload - LAN-X locomotive information payload.
	 * @returns Decoded locomotive information event, or no event for incomplete data.
	 */
	public decode(payload: Uint8Array): LocoInfoEvent[] {
		if (payload.length < 5) {
			return [];
		}

		const addr = decodeDccAddress(payload[0], payload[1]);
		const speed = decodeSpeed(payload[2], payload[3]);
		const functions = decodeFunctions(payload, 4);

		return [
			{
				event: Z21EventName.LOCO_INFO,
				payload: {
					addr,
					...speed,
					...functions,
					raw: Array.from(payload)
				}
			}
		];
	}
}
