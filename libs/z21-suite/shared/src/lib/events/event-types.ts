/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { LocoInfoEvent } from './loco/loco-info-event';
import type { CvNackEvent, CvResultEvent } from './programming';
import type { TurnoutInfoEvent } from './switching/turnout-info-event';
import type { BroadcastflagEvent } from './system/broadcastflag-event';
import type { SystemStateEvent } from './system/system-state-event';
import type { TrackPowerEvent } from './system/track-power-event';
import type { Z21CodeEvent } from './system/z21-code-event';
import type { Z21FirmwareVersionEvent } from './system/z21-firmware-version-event';
import type { Z21HwinfoEvent } from './system/z21-hwinfo-event';
import type { Z21SerialEvent } from './system/z21-serial-event';
import type { Z21StatusEvent } from './system/z21-status-event';
import type { Z21StoppedEvent } from './system/z21-stopped-event';
import type { Z21VersionEvent } from './system/z21-version-event';
import type { UnknownLanXEvent } from './unknown/unknown-lan-x-event';
import type { UnknownXBusEvent } from './unknown/unknown-x-bus-event';

/**
 * Union of all events derived from Z21 protocol data.
 */
export type Z21Event =
	| BroadcastflagEvent
	| CvNackEvent
	| CvResultEvent
	| LocoInfoEvent
	| SystemStateEvent
	| TrackPowerEvent
	| TurnoutInfoEvent
	| UnknownLanXEvent
	| UnknownXBusEvent
	| Z21CodeEvent
	| Z21FirmwareVersionEvent
	| Z21HwinfoEvent
	| Z21SerialEvent
	| Z21StatusEvent
	| Z21StoppedEvent
	| Z21VersionEvent;

/**
 * Derived flags for track state computed from system state bitfields.
 */
export type DerivedTrackFlags = {
	powerOn?: boolean;
	emergencyStop?: boolean;
	shortCircuit?: boolean;
	programmingMode?: boolean;
	highTemperature?: boolean;
	powerLost?: boolean;
	shortCircuitExternal?: boolean;
	shortCircuitInternal?: boolean;
	cseRCN2130Mode?: boolean;
};

/**
 * Bit flags for Z21 central status.
 */
export const enum CentralStatus {
	EmergencyStop = 0x01,
	TrackVoltageOff = 0x02,
	ShortCircuit = 0x04,
	ProgrammingModeActive = 0x20
}

/**
 * Bit flags for Z21 extended central status.
 */
export const enum CentralStatusEx {
	HighTemperature = 0x01,
	PowerLost = 0x02,
	ShortCircuitExternal = 0x04,
	ShortCircuitInternal = 0x08,
	CseRCN2130Mode = 0x20
}
