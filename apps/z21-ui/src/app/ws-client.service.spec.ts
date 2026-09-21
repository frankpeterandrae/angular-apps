/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed } from '@angular/core/testing';
import {
	PROTOCOL_VERSION,
	type ClientToServer,
	type CvNack,
	type CvRead,
	type CvResult,
	type ServerToClient
} from '@application-platform/protocol';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setupTestingModule } from '../test-setup';

import { WsClientService } from './ws-client.service';

type WebSocketHandlerMap = {
	onopen: ((event: Event) => void) | null;
	onclose: ((event: CloseEvent) => void) | null;
	onmessage: ((event: MessageEvent) => void) | null;
};

class MockWebSocket {
	public static readonly OPEN = 1;
	public static readonly CLOSED = 3;

	public readyState = MockWebSocket.OPEN;

	public onopen: ((event: Event) => void) | null = null;
	public onclose: ((event: CloseEvent) => void) | null = null;
	public onmessage: ((event: MessageEvent) => void) | null = null;

	public readonly send = vi.fn<(data: string) => void>();
	public readonly close = vi.fn();

	constructor(public readonly url: string) {}
}

describe('WsClientService', () => {
	let originalWebSocket: typeof WebSocket;
	let socket: MockWebSocket;

	const captureSocket = (instance: MockWebSocket): void => {
		socket = instance;
	};

	beforeEach(async () => {
		originalWebSocket = globalThis.WebSocket;

		const captureSocket = (instance: MockWebSocket): void => {
			socket = instance;
		};

		class TestWebSocket extends MockWebSocket {
			constructor(url: string | URL) {
				super(String(url));
				captureSocket(this);
			}
		}

		globalThis.WebSocket = TestWebSocket as unknown as typeof WebSocket;

		await setupTestingModule({
			providers: [WsClientService]
		});
	});

	afterEach(() => {
		globalThis.WebSocket = originalWebSocket;
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('connects to the application WebSocket endpoint', () => {
		TestBed.inject(WsClientService);

		expect(socket.url).toContain('/ws');
	});

	it('marks the connection as connected and sends the session hello on open', () => {
		const service = TestBed.inject(WsClientService);

		socket.onopen?.(new Event('open'));

		expect(service.status()).toBe('connected');

		const sent = JSON.parse(socket.send.mock.calls[0][0]) as ClientToServer;

		expect(sent).toEqual(
			expect.objectContaining({
				type: 'server.command.session.hello',
				payload: expect.objectContaining({
					protocolVersion: PROTOCOL_VERSION,
					clientName: 'ui'
				})
			})
		);
	});

	it('serializes and sends protocol messages when the socket is open', () => {
		const service = TestBed.inject(WsClientService);

		const message: ClientToServer = {
			type: 'system.command.trackpower.set',
			payload: {
				powerOn: true,
				requestId: 'req-1'
			}
		};

		expect(service.send(message)).toBe(true);

		expect(socket.send).toHaveBeenCalledWith(JSON.stringify(message));
	});

	it('does not send protocol messages when the socket is closed', () => {
		const service = TestBed.inject(WsClientService);

		socket.readyState = MockWebSocket.CLOSED;

		const message: ClientToServer = {
			type: 'system.command.trackpower.set',
			payload: {
				powerOn: true,
				requestId: 'req-1'
			}
		};

		expect(service.send(message)).toBe(false);
		expect(socket.send).not.toHaveBeenCalled();
	});

	it('forwards valid incoming messages to registered handlers', () => {
		const service = TestBed.inject(WsClientService);
		const handler = vi.fn();

		service.onMessage(handler);

		const message: ServerToClient = {
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		};

		socket.onmessage?.(
			new MessageEvent('message', {
				data: JSON.stringify(message)
			})
		);

		expect(handler).toHaveBeenCalledWith(message);
	});

	it('updates lastMessage for valid incoming messages', () => {
		const service = TestBed.inject(WsClientService);

		const message: ServerToClient = {
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		};

		socket.onmessage?.(
			new MessageEvent('message', {
				data: JSON.stringify(message)
			})
		);

		expect(JSON.parse(service.lastMessage())).toEqual([message]);
	});

	it('ignores malformed JSON messages', () => {
		const service = TestBed.inject(WsClientService);
		const handler = vi.fn();

		service.onMessage(handler);

		socket.onmessage?.(
			new MessageEvent('message', {
				data: '{not-json'
			})
		);

		expect(handler).not.toHaveBeenCalled();
		expect(service.lastMessage()).toBe('[]');
	});

	it('ignores messages rejected by the protocol validator', () => {
		const service = TestBed.inject(WsClientService);
		const handler = vi.fn();

		service.onMessage(handler);

		socket.onmessage?.(
			new MessageEvent('message', {
				data: JSON.stringify({
					type: 'unknown.message'
				})
			})
		);

		expect(handler).not.toHaveBeenCalled();
		expect(service.lastMessage()).toBe('[]');
	});

	it('unregisters message handlers', () => {
		const service = TestBed.inject(WsClientService);
		const handler = vi.fn();

		const unregister = service.onMessage(handler);

		unregister();

		const message: ServerToClient = {
			type: 'system.message.trackpower',
			payload: {
				powerOn: true,
				shortCircuit: false,
				emergencyStop: false,
				programmingMode: false
			}
		};

		socket.onmessage?.(
			new MessageEvent('message', {
				data: JSON.stringify(message)
			})
		);

		expect(handler).not.toHaveBeenCalled();
	});

	it('resolves a request when a matching CV result is received', async () => {
		const service = TestBed.inject(WsClientService);

		const promise = service.request<CvResult>((requestId): CvRead => ({
			type: 'programming.command.cv.read',
			payload: {
				requestId,
				cvAddress: 29
			}
		}));

		const sent = JSON.parse(socket.send.mock.calls[0][0]) as CvRead;

		const response: CvResult = {
			type: 'programming.replay.cv.result',
			payload: {
				requestId: sent.payload.requestId,
				cvAddress: 29,
				cvValue: 7
			}
		};

		socket.onmessage?.(
			new MessageEvent('message', {
				data: JSON.stringify(response)
			})
		);

		await expect(promise).resolves.toEqual(response);
	});

	it('rejects a request when a matching CV nack is received', async () => {
		const service = TestBed.inject(WsClientService);

		const promise = service.request<CvResult>((requestId): CvRead => ({
			type: 'programming.command.cv.read',
			payload: {
				requestId,
				cvAddress: 29
			}
		}));

		const sent = JSON.parse(socket.send.mock.calls[0][0]) as CvRead;

		const response: CvNack = {
			type: 'programming.replay.cv.nack',
			payload: {
				requestId: sent.payload.requestId,
				error: 'boom'
			}
		};

		socket.onmessage?.(
			new MessageEvent('message', {
				data: JSON.stringify(response)
			})
		);

		await expect(promise).rejects.toThrow('boom');
	});

	it('rejects a request immediately when the socket is not connected', async () => {
		const service = TestBed.inject(WsClientService);

		socket.readyState = MockWebSocket.CLOSED;

		const promise = service.request<CvResult>((requestId): CvRead => ({
			type: 'programming.command.cv.read',
			payload: {
				requestId,
				cvAddress: 29
			}
		}));

		await expect(promise).rejects.toThrow('WebSocket is not connected');
	});

	it('rejects pending requests when the connection closes', async () => {
		const service = TestBed.inject(WsClientService);

		const promise = service.request<CvResult>((requestId): CvRead => ({
			type: 'programming.command.cv.read',
			payload: {
				requestId,
				cvAddress: 29
			}
		}));

		socket.onclose?.(new CloseEvent('close'));

		expect(service.status()).toBe('disconnected');

		await expect(promise).rejects.toThrow('WebSocket connection closed');
	});

	it('rejects a request after its timeout', async () => {
		vi.useFakeTimers();

		const service = TestBed.inject(WsClientService);

		const promise = service.request<CvResult>(
			(requestId): CvRead => ({
				type: 'programming.command.cv.read',
				payload: {
					requestId,
					cvAddress: 29
				}
			}),
			{
				timeoutMs: 10
			}
		);

		const expectation = expect(promise).rejects.toThrow('Request timed out');

		await vi.advanceTimersByTimeAsync(10);

		await expectation;
	});
});
