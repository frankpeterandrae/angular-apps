/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21LanHeader } from '@application-platform/z21-shared';

import type { Z21Codec } from '../../../codec/codec';
import type { Z21BroadcastFlag } from '../../../constants';
import { encodeZ21LanFrame } from '../../../helper/x-bus-encoder';

/**
 * Encodes LAN-X and Z21 command station requests.
 */
export class SystemEncoder {
	constructor(private readonly codec: Z21Codec) {}

	/** Encodes a firmware version request. */
	public getFirmwareVersion(): Buffer {
		return this.codec.encodeLanX('LAN_X_GET_FIRMWARE_VERSION');
	}

	/** Encodes a system status request. */
	public getStatus(): Buffer {
		return this.codec.encodeLanX('LAN_X_GET_STATUS');
	}

	/** Encodes a global emergency stop command. */
	public stop(): Buffer {
		return this.codec.encodeLanX('LAN_X_SET_STOP');
	}

	/** Encodes a track power-off command. */
	public trackPowerOff(): Buffer {
		return this.codec.encodeLanX('LAN_X_SET_TRACK_POWER_OFF');
	}

	/** Encodes a track power-on command. */
	public trackPowerOn(): Buffer {
		return this.codec.encodeLanX('LAN_X_SET_TRACK_POWER_ON');
	}

	/** Encodes an X-Bus version request. */
	public getVersion(): Buffer {
		return this.codec.encodeLanX('LAN_X_GET_VERSION');
	}

	/** Encodes a hardware information request. */
	public getHardwareInfo(): Buffer {
		return encodeZ21LanFrame(Z21LanHeader.LAN_GET_HWINFO);
	}

	/** Encodes a command station code request. */
	public getCode(): Buffer {
		return encodeZ21LanFrame(Z21LanHeader.LAN_GET_CODE);
	}

	/** Encodes a broadcast flags request. */
	public getBroadcastFlags(): Buffer {
		return encodeZ21LanFrame(Z21LanHeader.LAN_GET_BROADCASTFLAGS);
	}

	/** Encodes a broadcast flags set command. */
	public setBroadcastFlags(flags: Z21BroadcastFlag): Buffer {
		const payload = Buffer.alloc(4);
		payload.writeUInt32LE(flags >>> 0, 0);

		return encodeZ21LanFrame(Z21LanHeader.LAN_SET_BROADCASTFLAGS, payload);
	}

	/** Encodes a system-state request. */
	public getSystemState(): Buffer {
		return encodeZ21LanFrame(Z21LanHeader.LAN_SYSTEMSTATE_GETDATA);
	}

	/** Encodes a session logoff command. */
	public logOff(): Buffer {
		return encodeZ21LanFrame(Z21LanHeader.LAN_LOGOFF);
	}
}
