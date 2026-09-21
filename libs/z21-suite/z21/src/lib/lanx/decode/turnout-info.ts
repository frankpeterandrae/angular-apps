/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { TurnoutState, Z21EventName, type TurnoutInfoEvent } from '@application-platform/z21-shared';

import { decodeDccAddress } from './_shared';

/**
 * Decodes LAN-X turnout information payloads.
 */
export class LanXTurnoutInfoDecoder {
	/**
	 * Decodes turnout address and state.
	 *
	 * @param payload - LAN-X turnout information payload.
	 * @returns Decoded turnout event, or no event for incomplete data.
	 */
	public decode(payload: Uint8Array): TurnoutInfoEvent[] {
		if (payload.length < 3) {
			return [];
		}

		const stateBits = payload[2] & 0x03;
		let state: TurnoutState;
		if (stateBits === 1) {
			state = TurnoutState.STRAIGHT;
		} else if (stateBits === 2) {
			state = TurnoutState.DIVERGING;
		} else {
			state = TurnoutState.UNKNOWN;
		}

		return [
			{
				event: Z21EventName.TURNOUT_INFO,
				payload: {
					addr: decodeDccAddress(payload[0], payload[1]),
					state,
					raw: Array.from(payload)
				}
			}
		];
	}
}
