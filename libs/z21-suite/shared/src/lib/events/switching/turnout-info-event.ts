/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export const TurnoutState = {
	STRAIGHT: 'STRAIGHT',
	DIVERGING: 'DIVERGING',
	UNKNOWN: 'UNKNOWN'
} as const;

export type TurnoutState = (typeof TurnoutState)[keyof typeof TurnoutState];

export type TurnoutInfoEventPayload = {
	addr: number;
	state: TurnoutState;
};

export type TurnoutInfoEvent = Event<Domain.SWITCHING, 'turnout.info', TurnoutInfoEventPayload>;
