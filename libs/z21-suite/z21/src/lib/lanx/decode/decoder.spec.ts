/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { XBusCmd, XHeader, Z21EventName, type Z21Event } from '@application-platform/z21-shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LanXCommandResolver } from '../dispatch';

import { LanXDecoder } from './decoder';

const mocks = vi.hoisted(() => ({
	resolve: vi.fn(),
	decodeFirmwareVersion: vi.fn(),
	decodeLocoInfo: vi.fn(),
	decodeCvNack: vi.fn(),
	decodeCvResult: vi.fn(),
	decodeStatus: vi.fn(),
	decodeStopped: vi.fn(),
	decodeTrackPower: vi.fn(),
	decodeTurnoutInfo: vi.fn(),
	decodeVersion: vi.fn()
}));

vi.mock('../dispatch', () => ({
	LanXCommandResolver: class {
		public resolve = mocks.resolve;
	}
}));

vi.mock('./firmware-version', () => ({
	LanXFirmwareVersionDecoder: class {
		public decode = mocks.decodeFirmwareVersion;
	}
}));

vi.mock('./loco-info', () => ({
	LanXLocoInfoDecoder: class {
		public decode = mocks.decodeLocoInfo;
	}
}));

vi.mock('./programming/cv-nack', () => ({
	LanXCvNackDecoder: class {
		public decode = mocks.decodeCvNack;
	}
}));

vi.mock('./programming/cv-result', () => ({
	LanXCvResultDecoder: class {
		public decode = mocks.decodeCvResult;
	}
}));

vi.mock('./status-changed', () => ({
	LanXStatusDecoder: class {
		public decode = mocks.decodeStatus;
	}
}));

vi.mock('./stopped', () => ({
	LanXStoppedDecoder: class {
		public decode = mocks.decodeStopped;
	}
}));

vi.mock('./track-power', () => ({
	LanXTrackPowerDecoder: class {
		public decode = mocks.decodeTrackPower;
	}
}));

vi.mock('./turnout-info', () => ({
	LanXTurnoutInfoDecoder: class {
		public decode = mocks.decodeTurnoutInfo;
	}
}));

vi.mock('./version', () => ({
	LanXVersionDecoder: class {
		public decode = mocks.decodeVersion;
	}
}));

describe('LanXDecoder', () => {
	let decoder: LanXDecoder;

	beforeEach(() => {
		vi.clearAllMocks();

		decoder = new LanXDecoder(new LanXCommandResolver());
	});

	it('delegates payload-based commands to the matching decoder', () => {
		const payload = Uint8Array.from([0x01, 0x02]);
		const events = [
			{
				event: Z21EventName.LOCO_INFO
			}
		] as Z21Event[];

		mocks.resolve.mockReturnValue('LAN_X_LOCO_INFO');
		mocks.decodeLocoInfo.mockReturnValue(events);

		const result = decoder.decode(XHeader.LOCO_INFO_ANSWER, payload);

		expect(result).toBe(events);
		expect(mocks.decodeLocoInfo).toHaveBeenCalledWith(payload);
	});

	it('passes the resolved command to command-based decoders', () => {
		const payload = Uint8Array.from([XBusCmd.BC_TRACK_POWER_ON]);

		mocks.resolve.mockReturnValue('LAN_X_BC_TRACK_POWER_ON');

		decoder.decode(XHeader.BROADCAST, payload);

		expect(mocks.decodeTrackPower).toHaveBeenCalledWith('LAN_X_BC_TRACK_POWER_ON');
	});

	it('routes programming NACK commands', () => {
		const payload = new Uint8Array();

		mocks.resolve.mockReturnValue('LAN_X_CV_NACK_SC');

		decoder.decode(XHeader.BROADCAST, payload);

		expect(mocks.decodeCvNack).toHaveBeenCalledWith('LAN_X_CV_NACK_SC');
	});

	it('routes programming result payloads', () => {
		const payload = Uint8Array.from([0x14, 0x00, 0x1c, 0x2a]);

		mocks.resolve.mockReturnValue('LAN_X_CV_RESULT');

		decoder.decode(XHeader.BROADCAST, payload);

		expect(mocks.decodeCvResult).toHaveBeenCalledWith(payload);
	});

	it('routes firmware version payloads', () => {
		const payload = Uint8Array.from([0x0a, 0x01, 0x23]);

		mocks.resolve.mockReturnValue('LAN_X_GET_FIRMWARE_VERSION_ANSWER');

		decoder.decode(XHeader.BROADCAST, payload);

		expect(mocks.decodeFirmwareVersion).toHaveBeenCalledWith(payload);
	});

	it('routes status payloads', () => {
		const payload = Uint8Array.from([XBusCmd.STATUS_CHANGED, 0x00]);

		mocks.resolve.mockReturnValue('LAN_X_STATUS_CHANGED');

		decoder.decode(XHeader.STATUS_CHANGED, payload);

		expect(mocks.decodeStatus).toHaveBeenCalledWith(payload);
	});

	it('routes stopped commands', () => {
		mocks.resolve.mockReturnValue('LAN_X_BC_STOPPED');

		decoder.decode(XHeader.BROADCAST, new Uint8Array());

		expect(mocks.decodeStopped).toHaveBeenCalledWith();
	});

	it('routes turnout information payloads', () => {
		const payload = Uint8Array.from([0x00, 0x03, 0x01]);

		mocks.resolve.mockReturnValue('LAN_X_TURNOUT_INFO');

		decoder.decode(XHeader.TURNOUT_INFO, payload);

		expect(mocks.decodeTurnoutInfo).toHaveBeenCalledWith(payload);
	});

	it('routes X-Bus version payloads', () => {
		const payload = Uint8Array.from([0x36, 0x12]);

		mocks.resolve.mockReturnValue('LAN_X_GET_VERSION_ANSWER');

		decoder.decode(XHeader.BROADCAST, payload);

		expect(mocks.decodeVersion).toHaveBeenCalledWith(payload);
	});

	it('returns no events when no decoder is registered', () => {
		mocks.resolve.mockReturnValue('LAN_X_UNKNOWN_COMMAND');

		expect(decoder.decode(XHeader.BROADCAST, new Uint8Array())).toEqual([]);
	});
});
