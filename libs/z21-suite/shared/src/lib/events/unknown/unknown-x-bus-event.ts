/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type UnknownXBusEvent = Event<Domain.UNKNOWN, 'x.bus', { xHeader: number; bytes: number[] }>;
