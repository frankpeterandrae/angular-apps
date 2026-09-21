/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type Z21StoppedEvent } from '@application-platform/z21-shared';

/**
 * Decodes LAN-X stopped notifications.
 */
export class LanXStoppedDecoder {
	/**
	 * Creates the event emitted when the command station reports a stop.
	 *
	 * @returns Stopped event.
	 */
	public decode(): Z21StoppedEvent[] {
		return [
			{
				event: Z21EventName.STOPPED,
				payload: {
					raw: []
				}
			}
		];
	}
}
