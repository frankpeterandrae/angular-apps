/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type Z21FirmwareVersionEvent = Event<
	Domain.SYSTEM,
	'firmware.version',
	{
		major: number;
		minor: number;
	}
>;
