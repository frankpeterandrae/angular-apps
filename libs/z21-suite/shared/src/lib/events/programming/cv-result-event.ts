/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type CvResultPayload = {
	/** One-based CV address, e.g. CV1 is represented as 1. */
	cv: number;
	/** CV value in the range 0–255. */
	value: number;
};

export type CvResultEvent = Event<Domain.PROGRAMMING, 'cv.result', CvResultPayload>;
