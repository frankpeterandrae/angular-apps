/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Domain } from '../../types';
import type { Event } from '../event';

export type Z21SerialEvent = Event<
	Domain.SYSTEM,
	'serial',
	{
		serial: number;
		raw: number[];
	}
>;
