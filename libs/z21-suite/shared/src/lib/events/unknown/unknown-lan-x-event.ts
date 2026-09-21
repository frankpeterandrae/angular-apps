/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Domain } from '../../types';
import { Event } from '../event';

export type UnknownLanXEvent = Event<Domain.UNKNOWN, 'lan_x', { xHeader: number; bytes: number[] }>;
