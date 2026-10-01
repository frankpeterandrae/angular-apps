/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type CvNackEventPayload = {
	/** Whether the command station reported a short circuit while programming. */
	shortCircuit: boolean;
};

export type CvNackEvent = Event<Domain.PROGRAMMING, 'cv.nack', CvNackEventPayload>;
