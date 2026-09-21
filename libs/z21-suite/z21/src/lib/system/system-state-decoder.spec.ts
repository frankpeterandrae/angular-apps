import { CentralStatus, CentralStatusEx } from '@application-platform/z21-shared';

import { SystemStateDecoder } from './system-state-decoder';

describe('SystemStateDecoder', () => {
	let decoder: SystemStateDecoder;

	beforeEach(() => {
		decoder = new SystemStateDecoder();
	});

	it('decodes a complete system state payload', () => {
		const payload = Uint8Array.from([0x01, 0x00, 0xfe, 0xff, 0x03, 0x00, 0xfc, 0xff, 0xe8, 0x03, 0xd0, 0x07, 0x07, 0x08, 0x00, 0x09]);

		expect(decoder.decode(payload)).toEqual({
			mainCurrentMa: 1,
			progCurrentMa: -2,
			filteredMainCurrentMa: 3,
			temperatureC: -4,
			supplyVoltageMv: 1000,
			vccVoltageMv: 2000,
			centralState: 0x07,
			centralStateEx: 0x08,
			capabilities: 0x09
		});
	});

	it.each([0, 15, 17])('rejects payload length %s', (length) => {
		expect(() => decoder.decode(new Uint8Array(length))).toThrow(`Invalid system state payload length (${length})`);
	});

	it('derives central and extended track flags', () => {
		const flags = decoder.deriveTrackFlags({
			centralState:
				CentralStatus.EmergencyStop |
				CentralStatus.TrackVoltageOff |
				CentralStatus.ShortCircuit |
				CentralStatus.ProgrammingModeActive,

			centralStateEx:
				CentralStatusEx.HighTemperature |
				CentralStatusEx.PowerLost |
				CentralStatusEx.ShortCircuitExternal |
				CentralStatusEx.ShortCircuitInternal |
				CentralStatusEx.CseRCN2130Mode
		});

		expect(flags).toEqual({
			powerOn: false,
			emergencyStop: true,
			shortCircuit: true,
			programmingMode: true,
			highTemperature: true,
			powerLost: true,
			shortCircuitExternal: true,
			shortCircuitInternal: true,
			cseRCN2130Mode: true
		});
	});

	it('derives normal operating state when no flags are set', () => {
		expect(
			decoder.deriveTrackFlags({
				centralState: 0,
				centralStateEx: 0
			})
		).toEqual({
			powerOn: true,
			emergencyStop: false,
			shortCircuit: false,
			programmingMode: false,
			highTemperature: false,
			powerLost: false,
			shortCircuitExternal: false,
			shortCircuitInternal: false,
			cseRCN2130Mode: false
		});
	});
});
