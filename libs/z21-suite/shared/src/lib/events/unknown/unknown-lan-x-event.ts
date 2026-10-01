/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain } from '../../types';
import type { Event } from '../event';

export type UnknownLanXEvent = Event<Domain.UNKNOWN, 'lan_x', { xHeader: number; bytes: number[] }>;
