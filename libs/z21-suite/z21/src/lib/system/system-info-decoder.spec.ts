import { Z21EventName } from '@application-platform/z21-shared';

import { Z21BroadcastFlag } from '../constants';

import { SystemInfoDecoder } from './system-info-decoder';

describe('SystemInfoDecoder', () => {
	let decoder: SystemInfoDecoder;

	beforeEach(() => {
		decoder = new SystemInfoDecoder();
	});

	describe('decodeHardwareInfo', () => {
		it('decodes known hardware and firmware version', () => {
			expect(decoder.decodeHardwareInfo(0x00000200, 0x00000120)).toEqual({
				event: Z21EventName.Z21_HWINFO,
				payload: {
					hardwareType: 'Z21_OLD',
					majorVersion: 1,
					minorVersion: 20,
					raw: [0x00000200, 0x00000120]
				}
			});
		});

		it('returns UNKNOWN for an unknown hardware type', () => {
			const event = decoder.decodeHardwareInfo(0x99999999, 0x00000120);

			expect(event.payload.hardwareType).toBe('UNKNOWN');
		});

		it('returns version 0.0 for invalid BCD data', () => {
			const event = decoder.decodeHardwareInfo(0x00000200, 0x000001fa);

			expect(event.payload.majorVersion).toBe(0);
			expect(event.payload.minorVersion).toBe(0);
		});
	});

	describe('decodeBroadcastFlags', () => {
		it('decodes combined broadcast flags', () => {
			const value = Z21BroadcastFlag.BASIC | Z21BroadcastFlag.SYSTEM_STATE;

			const event = decoder.decodeBroadcastFlags(value);

			expect(event.event).toBe(Z21EventName.BROADCAST_FLAGS);
			expect(event.payload.flags).toMatchObject({
				none: false,
				basic: true,
				systemState: true
			});
		});

		it('detects NONE', () => {
			const event = decoder.decodeBroadcastFlags(Z21BroadcastFlag.NONE);

			expect(event.payload.flags.none).toBe(true);
		});

		it('stores the raw flags as little-endian bytes', () => {
			const event = decoder.decodeBroadcastFlags(0x12345678);

			expect(event.payload.raw).toEqual([0x78, 0x56, 0x34, 0x12]);
		});
	});
});
