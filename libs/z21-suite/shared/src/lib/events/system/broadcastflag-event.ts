/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Broadcastflags, Domain } from '../../types';
import type { Event } from '../event';

export type BroadcastflagEvent = Event<
	Domain.SYSTEM,
	'broadcastflag',
	{
		flags: Broadcastflags;
	}
>;
