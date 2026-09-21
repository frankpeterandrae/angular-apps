/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type Z21StoppedEvent } from '@application-platform/z21-shared';

import { LanXStoppedDecoder } from './stopped';

describe('LanXStoppedDecoder', () => {
	it('creates a stopped event', () => {
		const decoder = new LanXStoppedDecoder();

		expect(decoder.decode()).toEqual<Z21StoppedEvent[]>([
			{
				event: Z21EventName.STOPPED,
				payload: {
					raw: []
				}
			}
		]);
	});
});
