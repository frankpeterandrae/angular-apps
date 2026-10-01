/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { Domain, PowerPayload } from '../../types';
import type { Event } from '../event';

export type Z21StatusEvent = Event<Domain.SYSTEM, 'status', PowerPayload>;
