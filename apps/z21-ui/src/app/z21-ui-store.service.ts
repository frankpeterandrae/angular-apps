/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Injectable, signal } from '@angular/core';
import type { ServerToClient } from '@application-platform/protocol';
import type { Direction } from '@application-platform/z21-shared';

/**
 * Stores and updates the state used by the Z21 UI.
 */
@Injectable({
	providedIn: 'root'
})
export class Z21UiStore {
	public readonly powerOn = signal(false);

	public readonly selectedAddr = signal(1845);
	public readonly draggingSpeed = signal(false);

	public readonly speedUi = signal(0);
	public readonly dir = signal<Direction>('FWD');
	public readonly functions = signal<Record<number, boolean>>({});

	public readonly turnoutAddr = signal(12);

	/**
	 * Update UI state from server-to-client message
	 * @param message - The server-to-client protocol message
	 */
	public updateFromServer(message: ServerToClient): void {
		switch (message.type) {
			case 'system.message.trackpower':
				this.powerOn.set(message.payload.powerOn);
				break;

			case 'loco.message.state':
				this.updateLocoState(message);
				break;

			case 'switching.message.turnout.state':
			case 'programming.replay.cv.nack':
			case 'programming.replay.cv.result':
			case 'server.replay.session.ready':
			case 'feedback.message.changed':
			case 'loco.message.eStop':
			case 'system.message.z21.code':
			case 'system.message.firmware.version':
			case 'system.message.hardware.info':
			case 'system.message.stop':
			case 'system.message.x.bus.version':
			case 'system.message.z21.rx':
			default:
				break;
		}
	}

	private updateLocoState(message: Extract<ServerToClient, { type: 'loco.message.state' }>): void {
		if (message.payload.addr !== this.selectedAddr() || this.draggingSpeed()) {
			return;
		}

		this.speedUi.set(this.step128ToUiSpeed(message.payload.speed));
		this.dir.set(message.payload.dir);
		this.functions.set(message.payload.fns);
	}

	private step128ToUiSpeed(step: number): number {
		return Math.max(0, Math.min(1, step / 126));
	}
}
