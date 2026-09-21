import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';

import type { Z21Codec } from '../../../codec/codec';

import { TurnoutEncoder } from './turnout-encoder';

describe('TurnoutEncoder', () => {
	let codec: DeepMocked<Z21Codec>;
	let encoder: TurnoutEncoder;

	beforeEach(() => {
		codec = DeepMock<Z21Codec>();
		encoder = new TurnoutEncoder(codec);
	});

	it('encodes turnout information request', () => {
		codec.encodeAccessoryAddress.mockReturnValue({
			adrMsb: 0x12,
			adrLsb: 0x34
		});

		encoder.getInfo(0x1234);

		expect(codec.encodeAccessoryAddress).toHaveBeenCalledWith(0x1234);
		expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_GET_TURNOUT_INFO', [0x12, 0x34]);
	});

	it.each([
		{
			port: 0 as const,
			activate: false,
			queue: false,
			expected: 0x80
		},
		{
			port: 1 as const,
			activate: false,
			queue: false,
			expected: 0x81
		},
		{
			port: 0 as const,
			activate: true,
			queue: false,
			expected: 0x88
		},
		{
			port: 1 as const,
			activate: true,
			queue: true,
			expected: 0xa9
		}
	])('encodes turnout control byte $expected', ({ port, activate, queue, expected }) => {
		codec.encodeAccessoryAddress.mockReturnValue({
			adrMsb: 0x12,
			adrLsb: 0x34
		});

		encoder.set(0x1234, port, activate, queue);

		expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_SET_TURNOUT', [0x12, 0x34, expected]);
	});
});
