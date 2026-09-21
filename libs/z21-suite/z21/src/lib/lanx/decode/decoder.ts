/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { LanXCommandKey, XHeader, Z21Event } from '@application-platform/z21-shared';

import type { LanXCommandResolver } from '../dispatch';

import { LanXFirmwareVersionDecoder } from './firmware-version';
import { LanXLocoInfoDecoder } from './loco-info';
import { LanXCvNackDecoder } from './programming/cv-nack';
import { LanXCvResultDecoder } from './programming/cv-result';
import { LanXStatusDecoder } from './status-changed';
import { LanXStoppedDecoder } from './stopped';
import { LanXTrackPowerDecoder } from './track-power';
import { LanXTurnoutInfoDecoder } from './turnout-info';
import { LanXVersionDecoder } from './version';

type LanXPayloadDecoder = (command: LanXCommandKey, payload: Uint8Array) => Z21Event[];

const firmwareVersionDecoder = new LanXFirmwareVersionDecoder();
const locoInfoDecoder = new LanXLocoInfoDecoder();
const cvNackDecoder = new LanXCvNackDecoder();
const cvResultDecoder = new LanXCvResultDecoder();
const statusDecoder = new LanXStatusDecoder();
const stoppedDecoder = new LanXStoppedDecoder();
const trackPowerDecoder = new LanXTrackPowerDecoder();
const turnoutInfoDecoder = new LanXTurnoutInfoDecoder();
const versionDecoder = new LanXVersionDecoder();

const DECODERS: Partial<Record<LanXCommandKey, LanXPayloadDecoder>> = {
	LAN_X_BC_PROGRAMMING_MODE: (cmd) => trackPowerDecoder.decode('LAN_X_BC_PROGRAMMING_MODE'),
	LAN_X_BC_STOPPED: () => stoppedDecoder.decode(),
	LAN_X_BC_TRACK_POWER_OFF: () => trackPowerDecoder.decode('LAN_X_BC_TRACK_POWER_OFF'),
	LAN_X_BC_TRACK_POWER_ON: () => trackPowerDecoder.decode('LAN_X_BC_TRACK_POWER_ON'),
	LAN_X_BC_TRACK_SHORT_CIRCUIT: () => trackPowerDecoder.decode('LAN_X_BC_TRACK_SHORT_CIRCUIT'),
	LAN_X_CV_NACK: (cmd) => cvNackDecoder.decode(cmd),
	LAN_X_CV_NACK_SC: (cmd) => cvNackDecoder.decode(cmd),
	LAN_X_CV_RESULT: (_, payload) => cvResultDecoder.decode(payload),
	LAN_X_GET_FIRMWARE_VERSION_ANSWER: (_, payload) => firmwareVersionDecoder.decode(payload),
	LAN_X_GET_VERSION_ANSWER: (_, payload) => versionDecoder.decode(payload),
	LAN_X_LOCO_INFO: (_, payload) => locoInfoDecoder.decode(payload),
	LAN_X_STATUS_CHANGED: (_, payload) => statusDecoder.decode(payload),
	LAN_X_TURNOUT_INFO: (_, payload) => turnoutInfoDecoder.decode(payload)
};

/**
 * Decodes LAN-X payloads into higher-level Z21 events.
 */
export class LanXDecoder {
	/**
	 * Creates a LAN-X payload decoder.
	 *
	 * @param resolver - Resolver used to identify LAN-X commands.
	 */
	constructor(private readonly resolver: LanXCommandResolver) {}

	/**
	 * Decodes an X-Bus payload into higher-level Z21 events.
	 *
	 * @param xHeader - X-Bus header.
	 * @param payload - X-Bus payload bytes.
	 * @returns Events produced by the matching decoder.
	 */
	public decode(xHeader: XHeader, payload: Uint8Array): Z21Event[] {
		const command = this.resolver.resolve(xHeader, payload);

		const decoder = DECODERS[command];

		return decoder?.(command, payload) ?? [];
	}
}
