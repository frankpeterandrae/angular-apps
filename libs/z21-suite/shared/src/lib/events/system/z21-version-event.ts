/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type Z21VersionEvent = Event<
	Domain.SYSTEM,
	'x.bus.version',
	{
		xBusVersion: number;
		xBusVersionString: string;
		cmdsId: number;
	}
>;
