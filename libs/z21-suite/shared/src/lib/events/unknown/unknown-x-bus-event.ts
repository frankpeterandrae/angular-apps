/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Domain } from '../../types';
import { Event } from '../event';

export type UnknownXBusEvent = Event<Domain.UNKNOWN, 'x.bus', { xHeader: number; bytes: number[] }>;
