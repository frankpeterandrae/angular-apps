/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CentralStatus, XBusCmd, Z21EventName, type Z21StatusEvent } from '@application-platform/z21-shared';

import { LanXStatusDecoder } from './status-changed';

describe('LanXStatusDecoder', () => {
	let decoder: LanXStatusDecoder;

	beforeEach(() => {
		decoder = new LanXStatusDecoder();
	});

	it('decodes central status flags', () => {
		const status = CentralStatus.EmergencyStop | CentralStatus.TrackVoltageOff | CentralStatus.ProgrammingModeActive;

		const [event] = decoder.decode(Uint8Array.from([XBusCmd.STATUS_CHANGED, status]));

		expect(event).toEqual<Z21StatusEvent>({
			event: Z21EventName.STATUS,
			payload: {
				emergencyStop: true,
				powerOn: false,
				programmingMode: true,
				shortCircuit: false,
				raw: [XBusCmd.STATUS_CHANGED, status]
			}
		});
	});

	it('decodes short circuit state', () => {
		const [event] = decoder.decode(Uint8Array.from([XBusCmd.STATUS_CHANGED, CentralStatus.ShortCircuit]));

		expect(event.payload.shortCircuit).toBe(true);
		expect(event.payload.powerOn).toBe(true);
	});

	it('returns no event for an incomplete payload', () => {
		expect(decoder.decode(Uint8Array.from([XBusCmd.STATUS_CHANGED]))).toEqual([]);
	});
});
