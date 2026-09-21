/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Direction, Z21EventName, type LocoInfoEvent } from '@application-platform/z21-shared';

import { InfoByteMask, LowFunctionsByteMask, SpeedByteMask } from '../../constants';

import { LanXLocoInfoDecoder } from './loco-info';

describe('LanXLocoInfoDecoder', () => {
	let decoder: LanXLocoInfoDecoder;

	beforeEach(() => {
		decoder = new LanXLocoInfoDecoder();
	});

	it('decodes locomotive information', () => {
		const payload = Uint8Array.from([
			0xc5,
			0x39,
			InfoByteMask.MM_LOCO | InfoByteMask.OCCUPIED | 0b10,
			SpeedByteMask.DIRECTION_FORWARD | 0b00101,
			LowFunctionsByteMask.L | LowFunctionsByteMask.D | LowFunctionsByteMask.S
		]);

		const [event] = decoder.decode(payload);

		expect(event).toEqual<LocoInfoEvent>({
			event: Z21EventName.LOCO_INFO,
			payload: {
				addr: 1337,
				speedSteps: 28,
				speed: 4,
				emergencyStop: false,
				direction: Direction.FWD,
				isMmLoco: true,
				isOccupied: true,
				isDoubleTraction: true,
				isSmartsearch: true,
				functionMap: {
					0: true,
					1: false,
					2: false,
					3: false,
					4: false
				},
				raw: Array.from(payload)
			}
		});
	});

	it('returns no event for an incomplete payload', () => {
		expect(decoder.decode(Uint8Array.from([0x00, 0x01, 0x00, 0x00]))).toEqual([]);
	});

	it('copies the raw payload', () => {
		const payload = Uint8Array.from([0x00, 0x01, 0x00, 0x00, 0x00]);

		const [event] = decoder.decode(payload);

		payload[0] = 0xff;

		expect(event.payload.raw[0]).toBe(0x00);
	});
});
