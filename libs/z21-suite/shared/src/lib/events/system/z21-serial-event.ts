/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type Z21SerialEvent = Event<
	Domain.SYSTEM,
	'serial',
	{
		serial: number;
		raw: number[];
	}
>;
