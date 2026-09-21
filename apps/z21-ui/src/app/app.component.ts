/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */
import { KeyValuePipe, type KeyValue } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import type { ServerToClient } from '@application-platform/protocol';
import { TurnoutState } from '@application-platform/z21-shared';

import { WsClientService } from './ws-client.service';
import { Z21UiStore } from './z21-ui-store.service';

const CV_REQUEST_TIMEOUT_MS = 8_000;
const TURNOUT_PULSE_MS = 200;
/**
 * Root component for locomotive, turnout, track-power and CV controls.
 */
@Component({
	selector: 'z21-app-root',
	imports: [KeyValuePipe],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	protected readonly cvAddress = signal(29);
	protected readonly cvValue = signal<number | null>(null);
	protected readonly cvError = signal<string | null>(null);

	protected readonly ws = inject(WsClientService);
	protected readonly store = inject(Z21UiStore);

	protected readonly TurnoutState = TurnoutState;

	private readonly destroyRef = inject(DestroyRef);

	constructor() {
		const unsubscribe = this.ws.onMessage((message) => this.store.updateFromServer(message));

		this.destroyRef.onDestroy(unsubscribe);
	}

	protected setSpeed(speed: number): void {
		const normalizedSpeed = this.normalizeSpeed(speed);

		this.store.speedUi.set(normalizedSpeed);

		this.ws.send({
			type: 'loco.command.drive',
			payload: {
				addr: this.store.selectedAddr(),
				speedStep: this.uiSpeedToStep128(normalizedSpeed),
				dir: this.store.dir(),
				steps: 128,
				requestId: crypto.randomUUID()
			}
		});
	}

	private normalizeSpeed(speed: number): number {
		return Math.max(0, Math.min(1, speed));
	}

	private uiSpeedToStep128(speed: number): number {
		return Math.round(speed * 126);
	}

	protected sendFn(fn: number, on: boolean): void {
		const requestId = crypto.randomUUID();
		this.ws.send({ type: 'loco.command.function.set', payload: { addr: this.store.selectedAddr(), fn, on, requestId } });
	}

	protected sendTurnout(state: TurnoutState): void {
		const requestId = crypto.randomUUID();
		this.ws.send({
			type: 'switching.command.turnout.set',
			payload: { addr: this.store.turnoutAddr(), state, pulseMs: TURNOUT_PULSE_MS, requestId }
		});
	}

	protected sendEStop(): void {
		const requestId = crypto.randomUUID();
		this.ws.send({ type: 'loco.command.eStop', payload: { addr: this.store.selectedAddr(), requestId } });
	}

	protected togglePower(): void {
		const powerOn = !this.store.powerOn();

		this.store.powerOn.set(powerOn);

		this.ws.send({
			type: 'system.command.trackpower.set',
			payload: {
				powerOn,
				requestId: crypto.randomUUID()
			}
		});
	}

	protected async readCv(): Promise<void> {
		this.cvError.set(null);
		this.cvValue.set(null);

		try {
			const res = await this.ws.request<Extract<ServerToClient, { type: 'programming.replay.cv.result' }>>(
				(requestId) => ({
					type: 'programming.command.cv.read',

					payload: { requestId, cvAddress: this.cvAddress() }
				}),
				{ timeoutMs: CV_REQUEST_TIMEOUT_MS }
			);

			this.cvValue.set(res.payload.cvValue);
		} catch (error) {
			this.cvError.set(this.getErrorMessage(error));
		}
	}

	private getErrorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}

	protected async writeCv(): Promise<void> {
		this.cvError.set(null);

		const value = this.cvValue();
		if (value === null) {
			this.cvError.set('cvValue is null');
			return;
		}

		try {
			await this.ws.request<Extract<ServerToClient, { type: 'programming.replay.cv.result' }>>(
				(requestId) => ({
					type: 'programming.command.cv.write',
					payload: { requestId, cvAddress: this.cvAddress(), cvValue: value }
				}),
				{ timeoutMs: CV_REQUEST_TIMEOUT_MS }
			);
		} catch (error) {
			this.cvError.set(this.getErrorMessage(error));
		}
	}

	protected setLocoNumber(number: number): void {
		this.store.selectedAddr.set(number);
	}

	protected draggingSpeed(dragging: boolean): void {
		this.store.draggingSpeed.set(dragging);
	}

	protected numericKeySort(a: KeyValue<string, unknown>, b: KeyValue<string, unknown>): number {
		const aNumber = Number(a.key);
		const bNumber = Number(b.key);

		if (Number.isNaN(aNumber) && Number.isNaN(bNumber)) {
			return 0;
		}

		if (Number.isNaN(aNumber)) {
			return -1;
		}

		if (Number.isNaN(bNumber)) {
			return 1;
		}

		return aNumber - bNumber;
	}
}
