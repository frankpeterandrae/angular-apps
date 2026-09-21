/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import { Direction } from '@application-platform/z21-shared';

import type { Z21Codec } from '../../../codec/codec';
import { LocoFunctionSwitchType, SpeedByteMask } from '../../../constants';

import { LocoEncoder } from './loco-encoder';

describe('LocoEncoder', () => {
	let codec: DeepMocked<Z21Codec>;
	let encoder: LocoEncoder;

	beforeEach(() => {
		codec = DeepMock<Z21Codec>();
		encoder = new LocoEncoder(codec);
	});

	describe('drive', () => {
		it.each([
			{
				speedStep: 0,
				direction: Direction.REV,
				expectedSpeedByte: 0x00
			},
			{
				speedStep: 1,
				direction: Direction.REV,
				expectedSpeedByte: 0x02
			},
			{
				speedStep: 126,
				direction: Direction.REV,
				expectedSpeedByte: 0x7f
			},
			{
				speedStep: 1,
				direction: Direction.FWD,
				expectedSpeedByte: SpeedByteMask.DIRECTION_FORWARD | 0x02
			}
		])('encodes speed step $speedStep', ({ speedStep, direction, expectedSpeedByte }) => {
			codec.encodeLocoAddress.mockReturnValue({
				adrMsb: 0xc1,
				adrLsb: 0x2c
			});

			const expected = Buffer.from([0x01]);
			codec.encodeLanX.mockReturnValue(expected);

			const result = encoder.drive(300, speedStep, direction);

			expect(codec.encodeLocoAddress).toHaveBeenCalledWith(300);
			expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_SET_LOCO_DRIVE_128', [0xc1, 0x2c, expectedSpeedByte]);
			expect(result).toBe(expected);
		});

		it.each([-1, 127, 128])('rejects invalid speed step %s', (speedStep) => {
			expect(() => encoder.drive(3, speedStep, Direction.FWD)).toThrow('out of range');
		});
	});

	it('encodes locomotive emergency stop', () => {
		codec.encodeLocoAddress.mockReturnValue({
			adrMsb: 0x00,
			adrLsb: 0x03
		});

		encoder.emergencyStop(3);

		expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_SET_LOCO_E_STOP', [0x00, 0x03]);
	});

	describe('setFunction', () => {
		it('encodes function number and switch type', () => {
			codec.encodeLocoAddress.mockReturnValue({
				adrMsb: 0x00,
				adrLsb: 0x03
			});

			encoder.setFunction(3, 10, LocoFunctionSwitchType.ON);

			const expectedFunctionByte = ((LocoFunctionSwitchType.ON & 0b11) << 6) | 10;

			expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_SET_LOCO_FUNCTION', [0x00, 0x03, expectedFunctionByte]);
		});

		it.each([-1, 32])('rejects invalid function number %s', (functionNumber) => {
			expect(() => encoder.setFunction(3, functionNumber, LocoFunctionSwitchType.ON)).toThrow('out of range');
		});
	});

	it('encodes locomotive information request', () => {
		codec.encodeLocoAddress.mockReturnValue({
			adrMsb: 0xc5,
			adrLsb: 0x39
		});

		encoder.getInfo(1337);

		expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_GET_LOCO_INFO', [0xc5, 0x39]);
	});
});
