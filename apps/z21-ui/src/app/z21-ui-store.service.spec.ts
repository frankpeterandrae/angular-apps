/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { ServerToClient } from '@application-platform/protocol';
import { beforeEach, describe, expect, it } from 'vitest';

import { Z21UiStore } from './z21-ui-store.service';

describe('Z21UiStore', () => {
	let store: Z21UiStore;

	beforeEach(() => {
		store = new Z21UiStore();
	});

	it('updates track power state', () => {
		const powerOnMessage: ServerToClient = {
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		};

		store.updateFromServer(powerOnMessage);

		expect(store.powerOn()).toBe(true);
	});

	it('updates the selected locomotive state', () => {
		const message: ServerToClient = {
			type: 'loco.message.state',
			payload: {
				addr: store.selectedAddr(),
				speed: 63,
				dir: 'REV',
				fns: {
					0: true,
					3: false
				},
				estop: false
			}
		};

		store.updateFromServer(message);

		expect(store.speedUi()).toBeCloseTo(63 / 126);
		expect(store.dir()).toBe('REV');
		expect(store.functions()).toEqual({
			0: true,
			3: false
		});
	});

	it('ignores locomotive state for another address', () => {
		const message: ServerToClient = {
			type: 'loco.message.state',
			payload: {
				addr: 9999,
				speed: 126,
				dir: 'REV',
				fns: {
					1: true
				},
				estop: false
			}
		};

		store.updateFromServer(message);

		expect(store.speedUi()).toBe(0);
		expect(store.dir()).toBe('FWD');
		expect(store.functions()).toEqual({});
	});

	it('ignores locomotive state while the speed control is being dragged', () => {
		store.draggingSpeed.set(true);
		store.speedUi.set(0.25);

		const message: ServerToClient = {
			type: 'loco.message.state',
			payload: {
				addr: store.selectedAddr(),
				speed: 100,
				dir: 'REV',
				fns: {
					2: true
				},
				estop: false
			}
		};

		store.updateFromServer(message);

		expect(store.speedUi()).toBe(0.25);
		expect(store.dir()).toBe('FWD');
		expect(store.functions()).toEqual({});
	});

	it.each([
		[0, 0],
		[63, 0.5],
		[126, 1],
		[200, 1],
		[-10, 0]
	])('maps speed step %i to UI speed %f', (speed, expected) => {
		const message: ServerToClient = {
			type: 'loco.message.state',
			payload: {
				addr: store.selectedAddr(),
				speed,
				dir: 'FWD',
				fns: {},
				estop: false
			}
		};

		store.updateFromServer(message);

		expect(store.speedUi()).toBeCloseTo(expected);
	});

	it('replaces the locomotive function state', () => {
		const firstMessage: ServerToClient = {
			type: 'loco.message.state',
			payload: {
				addr: store.selectedAddr(),
				speed: 10,
				dir: 'FWD',
				fns: {
					1: true
				},
				estop: false
			}
		};

		const secondMessage: ServerToClient = {
			type: 'loco.message.state',
			payload: {
				addr: store.selectedAddr(),
				speed: 20,
				dir: 'FWD',
				fns: {
					2: false
				},
				estop: false
			}
		};

		store.updateFromServer(firstMessage);
		store.updateFromServer(secondMessage);

		expect(store.functions()).toEqual({
			2: false
		});
	});
});
