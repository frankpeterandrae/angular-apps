/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type SystemStateEvent = Event<Domain.SYSTEM, 'state', Z21SystemState>;
/**
 * Parsed Z21 system state fields, as defined by the protocol.
 */
export type Z21SystemState = {
	mainCurrentMa: number; // int16
	progCurrentMa: number; // int16
	filteredMainCurrentMa: number; // int16
	temperatureC: number; // int16
	supplyVoltageMv: number; // uint16
	vccVoltageMv: number; // uint16
	centralState: number; // uint8 bitmask
	centralStateEx: number; // uint8 bitmask
	capabilities: number; // uint8
};
