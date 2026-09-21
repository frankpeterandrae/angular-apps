import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';

import type { Z21Codec } from '../../../codec/codec';

import { SystemEncoder } from './system-encoder';

describe('SystemEncoder', () => {
	let codec: DeepMocked<Z21Codec>;
	let encoder: SystemEncoder;

	beforeEach(() => {
		codec = DeepMock<Z21Codec>();
		encoder = new SystemEncoder(codec);
	});

	it.each([
		{
			method: 'getFirmwareVersion',
			command: 'LAN_X_GET_FIRMWARE_VERSION'
		},
		{
			method: 'getStatus',
			command: 'LAN_X_GET_STATUS'
		},
		{
			method: 'stop',
			command: 'LAN_X_SET_STOP'
		},
		{
			method: 'trackPowerOff',
			command: 'LAN_X_SET_TRACK_POWER_OFF'
		},
		{
			method: 'trackPowerOn',
			command: 'LAN_X_SET_TRACK_POWER_ON'
		},
		{
			method: 'getVersion',
			command: 'LAN_X_GET_VERSION'
		}
	] as const)('$method encodes $command', ({ method, command }) => {
		const expected = Buffer.from([0x01]);
		codec.encodeLanX.mockReturnValue(expected);

		const result = encoder[method]();

		expect(codec.encodeLanX).toHaveBeenCalledWith(command);
		expect(result).toBe(expected);
	});
});
