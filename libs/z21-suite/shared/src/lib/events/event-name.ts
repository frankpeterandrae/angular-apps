/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Z21Event } from './event-types';

/**
 * Event names emitted from decoded Z21 protocol data.
 */
export const Z21EventName = {
	BROADCAST_FLAGS: 'system.event.broadcastflag',
	CV_NACK: 'programming.event.cv.nack',
	CV_RESULT: 'programming.event.cv.result',
	FIRMWARE_VERSION: 'system.event.firmware.version',
	LOCO_INFO: 'loco.event.info',
	STATUS: 'system.event.status',
	STOPPED: 'system.event.stopped',
	SYSTEM_STATE: 'system.event.state',
	TRACK_POWER: 'system.event.track.power',
	TURNOUT_INFO: 'switching.event.turnout.info',
	X_BUS_VERSION: 'system.event.x.bus.version',
	Z21_CODE: 'system.event.z21.code',
	Z21_HWINFO: 'system.event.hwinfo',
	SERIAL: 'system.event.serial',
	UNKNOWN_LAN_X: 'unknown.event.lan_x',
	UNKNOWN_X_BUS: 'unknown.event.x.bus'
} as const satisfies Record<string, Z21Event['event']>;
