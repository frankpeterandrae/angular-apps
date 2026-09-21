/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import type { ClientToServer, ServerToClient } from '@application-platform/protocol';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupTestingModule } from '../test-setup';

import { AppComponent } from './app.component';
import { WsClientService } from './ws-client.service';
import { Z21UiStore } from './z21-ui-store.service';

type MessageHandler = (message: ServerToClient) => void;

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;
	let store: Z21UiStore;

	let messageHandler: MessageHandler | undefined;

	const send = vi.fn<(message: ClientToServer) => void>();
	const request = vi.fn();
	const unsubscribe = vi.fn();

	beforeEach(async () => {
		send.mockReset();
		request.mockReset();
		unsubscribe.mockReset();

		messageHandler = undefined;

		const wsMock = {
			status: vi.fn(() => 'connected'),
			lastMessage: vi.fn(() => ''),
			onMessage: vi.fn((handler: MessageHandler) => {
				messageHandler = handler;

				return unsubscribe;
			}),
			send,
			request
		};

		await setupTestingModule({
			imports: [AppComponent],
			providers: [
				{
					provide: WsClientService,
					useValue: wsMock
				}
			]
		});

		fixture = TestBed.createComponent(AppComponent);
		store = TestBed.inject(Z21UiStore);

		fixture.detectChanges();
	});

	it('renders the application', () => {
		const heading = fixture.nativeElement.querySelector('h1') as HTMLHeadingElement;

		expect(heading.textContent).toContain('Z21 UI');
	});

	it('updates the selected locomotive address from the input', () => {
		const input = fixture.nativeElement.querySelector('#loco') as HTMLInputElement;

		input.value = '42';
		input.dispatchEvent(new Event('input'));

		expect(store.selectedAddr()).toBe(42);
	});

	it('sends a drive command when the speed input changes', () => {
		store.selectedAddr.set(42);
		store.dir.set('REV');

		fixture.detectChanges();

		const input = fixture.nativeElement.querySelector('#speed') as HTMLInputElement;

		input.value = '0.55';
		input.dispatchEvent(new Event('input'));

		expect(store.speedUi()).toBeCloseTo(0.55);

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'loco.command.drive',
				payload: expect.objectContaining({
					addr: 42,
					speedStep: 69,
					dir: 'REV',
					steps: 128
				})
			})
		);
	});

	it('clamps speed values before sending them', () => {
		const input = fixture.nativeElement.querySelector('#speed') as HTMLInputElement;

		input.value = '2';
		input.dispatchEvent(new Event('input'));

		expect(store.speedUi()).toBe(1);

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'loco.command.drive',
				payload: expect.objectContaining({
					speedStep: 126
				})
			})
		);
	});

	it('tracks speed dragging through pointer events', () => {
		const input = fixture.nativeElement.querySelector('#speed') as HTMLInputElement;

		input.dispatchEvent(new Event('pointerdown'));

		expect(store.draggingSpeed()).toBe(true);

		input.dispatchEvent(new Event('pointerup'));

		expect(store.draggingSpeed()).toBe(false);
	});

	it('sends an emergency stop for the selected locomotive', () => {
		store.selectedAddr.set(99);

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('#loco-estop') as HTMLButtonElement;

		button.click();

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'loco.command.eStop',
				payload: expect.objectContaining({
					addr: 99
				})
			})
		);
	});

	it('changes the locomotive direction through the UI', () => {
		store.dir.set('FWD');

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('#loco-direction') as HTMLButtonElement;

		button.click();

		expect(store.dir()).toBe('REV');

		fixture.detectChanges();

		expect(button.textContent).toContain('REV');
	});

	it('renders locomotive functions in numeric order', () => {
		store.functions.set({
			10: false,
			2: true,
			1: false
		});

		fixture.detectChanges();

		const buttons = Array.from(fixture.nativeElement.querySelectorAll('[id^="loco-function-"]')) as HTMLButtonElement[];

		expect(buttons.map((button) => button.id)).toEqual(['loco-function-1', 'loco-function-2', 'loco-function-10']);
	});

	it('sends a locomotive function command from the UI', () => {
		store.selectedAddr.set(7);

		store.functions.set({
			2: false
		});

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('#loco-function-2') as HTMLButtonElement;

		button.click();

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'loco.command.function.set',
				payload: expect.objectContaining({
					addr: 7,
					fn: 2,
					on: true
				})
			})
		);
	});

	it('updates the turnout address from the input', () => {
		const input = fixture.nativeElement.querySelector('#turnout') as HTMLInputElement;

		input.value = '123';
		input.dispatchEvent(new Event('input'));

		expect(store.turnoutAddr()).toBe(123);
	});

	it('sends the diverging turnout command', () => {
		store.turnoutAddr.set(123);

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('#turnout-diverging') as HTMLButtonElement;

		button.click();

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'switching.command.turnout.set',
				payload: expect.objectContaining({
					addr: 123,
					state: 'DIVERGING',
					pulseMs: 200
				})
			})
		);
	});

	it('toggles track power through the UI', () => {
		store.powerOn.set(false);

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('#track-power') as HTMLButtonElement;

		button.click();

		expect(store.powerOn()).toBe(true);

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'system.command.trackpower.set',
				payload: expect.objectContaining({
					powerOn: true
				})
			})
		);
	});

	it('forwards incoming WebSocket messages to the store', () => {
		const updateSpy = vi.spyOn(store, 'updateFromServer');

		const message: ServerToClient = {
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		};

		messageHandler?.(message);

		expect(updateSpy).toHaveBeenCalledWith(message);
	});

	it('reads a CV through the UI', async () => {
		request.mockResolvedValue({
			type: 'programming.replay.cv.result',
			payload: {
				requestId: 'req-1',
				cvAddress: 29,
				cvValue: 7
			}
		});

		const addressInput = fixture.nativeElement.querySelector('#cv') as HTMLInputElement;

		addressInput.value = '29';
		addressInput.dispatchEvent(new Event('input'));

		const button = fixture.nativeElement.querySelector('#cv-read') as HTMLButtonElement;

		button.click();

		await fixture.whenStable();
		fixture.detectChanges();

		const valueInput = fixture.nativeElement.querySelector('#cvValue') as HTMLInputElement;

		expect(valueInput.value).toBe('7');

		expect(request).toHaveBeenCalledOnce();
	});

	it('writes a CV through the UI', async () => {
		request.mockResolvedValue({
			type: 'programming.replay.cv.result',
			payload: {
				requestId: 'req-1',
				cvAddress: 29,
				cvValue: 12
			}
		});

		const valueInput = fixture.nativeElement.querySelector('#cvValue') as HTMLInputElement;

		valueInput.value = '12';
		valueInput.dispatchEvent(new Event('input'));

		const button = fixture.nativeElement.querySelector('#cv-write') as HTMLButtonElement;

		button.click();

		await fixture.whenStable();

		expect(request).toHaveBeenCalledOnce();
	});

	it('unsubscribes from WebSocket messages on destroy', () => {
		fixture.destroy();

		expect(unsubscribe).toHaveBeenCalledOnce();
	});

	it('shows an error when reading a CV fails', async () => {
		request.mockRejectedValue(new Error('CV read failed'));

		const button = fixture.nativeElement.querySelector('#cv-read') as HTMLButtonElement;

		button.click();

		await fixture.whenStable();
		fixture.detectChanges();

		const error = fixture.nativeElement.querySelector('#cv-error') as HTMLElement;

		expect(error.textContent).toContain('CV read failed');
	});

	it('shows an error when writing a CV fails', async () => {
		request.mockRejectedValue(new Error('CV write failed'));

		const valueInput = fixture.nativeElement.querySelector('#cvValue') as HTMLInputElement;

		valueInput.value = '12';
		valueInput.dispatchEvent(new Event('input'));

		const button = fixture.nativeElement.querySelector('#cv-write') as HTMLButtonElement;

		button.click();

		await fixture.whenStable();
		fixture.detectChanges();

		const error = fixture.nativeElement.querySelector('#cv-error') as HTMLElement;

		expect(error.textContent).toContain('CV write failed');
	});

	it('shows an error when writing without a CV value', async () => {
		const button = fixture.nativeElement.querySelector('#cv-write') as HTMLButtonElement;

		button.click();

		await fixture.whenStable();
		fixture.detectChanges();

		const error = fixture.nativeElement.querySelector('#cv-error') as HTMLElement;

		expect(error.textContent).toContain('cvValue is null');
		expect(request).not.toHaveBeenCalled();
	});

	it('shows non-Error CV failures as text', async () => {
		request.mockRejectedValue('Connection lost');

		const button = fixture.nativeElement.querySelector('#cv-read') as HTMLButtonElement;

		button.click();

		await fixture.whenStable();
		fixture.detectChanges();

		const error = fixture.nativeElement.querySelector('#cv-error') as HTMLElement;

		expect(error.textContent).toContain('Connection lost');
	});
});
