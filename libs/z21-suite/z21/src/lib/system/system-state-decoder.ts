/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CentralStatus, CentralStatusEx, type DerivedTrackFlags, type Z21SystemState } from '@application-platform/z21-shared';

/**
 * Decodes Z21 system state data.
 */
export class SystemStateDecoder {
	/**
	 * Decodes the 16-byte system state payload.
	 *
	 * @param payload - Raw Z21 system state payload.
	 * @returns Decoded system state.
	 */
	public decode(payload: Uint8Array): Z21SystemState {
		if (payload.length !== 16) {
			throw new Error(`Invalid system state payload length (${payload.length})`);
		}

		const buffer = Buffer.from(payload);

		return {
			mainCurrentMa: buffer.readInt16LE(0),
			progCurrentMa: buffer.readInt16LE(2),
			filteredMainCurrentMa: buffer.readInt16LE(4),
			temperatureC: buffer.readInt16LE(6),
			supplyVoltageMv: buffer.readUInt16LE(8),
			vccVoltageMv: buffer.readUInt16LE(10),
			centralState: buffer.readUInt8(12),
			centralStateEx: buffer.readUInt8(13),
			capabilities: buffer.readUInt8(15)
		};
	}

	/**
	 * Derives track flags from the supplied system state.
	 * @param systemState - System state containing central state and extended central state.
	 * @returns Derived track flags.
	 */
	public deriveTrackFlags(systemState: Pick<Z21SystemState, 'centralState' | 'centralStateEx'>): DerivedTrackFlags {
		const { centralState, centralStateEx } = systemState;

		return {
			powerOn: (centralState & CentralStatus.TrackVoltageOff) === 0,

			emergencyStop: (centralState & CentralStatus.EmergencyStop) !== 0,

			shortCircuit: (centralState & CentralStatus.ShortCircuit) !== 0,

			programmingMode: (centralState & CentralStatus.ProgrammingModeActive) !== 0,

			highTemperature: (centralStateEx & CentralStatusEx.HighTemperature) !== 0,

			powerLost: (centralStateEx & CentralStatusEx.PowerLost) !== 0,

			shortCircuitExternal: (centralStateEx & CentralStatusEx.ShortCircuitExternal) !== 0,

			shortCircuitInternal: (centralStateEx & CentralStatusEx.ShortCircuitInternal) !== 0,

			cseRCN2130Mode: (centralStateEx & CentralStatusEx.CseRCN2130Mode) !== 0
		};
	}
}
