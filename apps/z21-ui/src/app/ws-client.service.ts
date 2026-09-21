/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { computed, Injectable, signal } from '@angular/core';
import { MessageValidator, PROTOCOL_VERSION, type ClientToServer, type ServerToClient } from '@application-platform/protocol';

type PendingRequest = {
	resolve: (message: ServerToClient) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
};

type MessageHandler = (message: ServerToClient) => void;

/**
 * Service that manages a WebSocket connection to the server.
 * Provides methods to send messages, make requests, and handle incoming messages.
 */
@Injectable({
	providedIn: 'root'
})
export class WsClientService {
	public readonly status = signal<'disconnected' | 'connected'>('disconnected');

	private readonly messages = signal<ServerToClient[]>([]);
	public readonly lastMessage = computed(() => JSON.stringify(this.messages(), null, 2));

	private ws?: WebSocket;

	private readonly pending = new Map<string, PendingRequest>();

	private readonly handlers = new Set<MessageHandler>();

	constructor() {
		this.connect();
	}

	/**
	 * Registers a message handler that will be called for every incoming message.
	 * @param handler - The message handler function
	 * @returns A function to unregister the handler
	 */
	public onMessage(handler: MessageHandler): () => void {
		this.handlers.add(handler);
		return () => this.handlers.delete(handler);
	}

	private emit(message: ServerToClient): void {
		for (const handler of this.handlers) {
			handler(message);
		}
	}

	private connect(): void {
		const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		this.ws = new WebSocket(`${protocol}//${location.host}/ws`);

		this.ws.onopen = (): void => {
			this.status.set('connected');
			const requestId = crypto.randomUUID();
			this.send({
				type: 'server.command.session.hello',
				payload: { protocolVersion: PROTOCOL_VERSION, clientName: 'ui', requestId }
			});
		};

		this.ws.onclose = (): void => {
			this.status.set('disconnected');
			this.rejectPendingRequests(new Error('WebSocket connection closed'));
		};

		this.ws.onmessage = (event): void => {
			this.handleMessage(event);
		};
	}

	/**
	 * Sends a protocol message when the WebSocket connection is open.
	 */
	public send(message: ClientToServer): boolean {
		if (this.ws?.readyState !== WebSocket.OPEN) {
			return false;
		}

		this.ws.send(JSON.stringify(message));
		return true;
	}

	/**
	 * Sends a request message and returns a promise that resolves with the corresponding response.
	 * @param messageBuilder - Function that builds the request message given a unique requestId
	 * @param options - Optional settings for the request
	 *  - timeoutMs: Duration in milliseconds to wait for a response before rejecting (default: 50000ms)
	 * @returns Promise that resolves with the response message of type TOk
	 */
	public request<TOk extends ServerToClient>(
		messageBuilder: (requestId: string) => ClientToServer,
		options?: { timeoutMs?: number }
	): Promise<TOk> {
		const requestId = crypto.randomUUID();
		const timeoutMs = options?.timeoutMs ?? 50_000;

		return new Promise<TOk>((resolve, reject) => {
			const timer = globalThis.setTimeout(() => {
				this.pending.delete(requestId);
				reject(new Error('Request timed out'));
			}, timeoutMs);

			this.pending.set(requestId, {
				resolve: (response) => resolve(response as TOk),
				reject,
				timer
			});

			if (this.send(messageBuilder(requestId))) {
				return;
			}

			globalThis.clearTimeout(timer);
			this.pending.delete(requestId);
			reject(new Error('WebSocket is not connected'));
		});
	}

	/**
	 * Handles incoming messages from the server.
	 * @param message - The incoming ServerToClient message
	 */
	private handleIncoming(message: ServerToClient): void {
		this.emit(message);

		if (message.type !== 'programming.replay.cv.result' && message.type !== 'programming.replay.cv.nack') {
			return;
		}

		const requestId = message.payload.requestId;
		const pending = this.pending.get(requestId);
		if (!pending) {
			return;
		}

		globalThis.clearTimeout(pending.timer);
		this.pending.delete(requestId);

		if (message.type === 'programming.replay.cv.result') {
			pending.resolve(message);
		} else {
			pending.reject(new Error(message.payload.error));
		}
	}

	private rejectPendingRequests(error: Error): void {
		for (const pending of this.pending.values()) {
			globalThis.clearTimeout(pending.timer);
			pending.reject(error);
		}

		this.pending.clear();
	}

	private handleMessage(event: MessageEvent): void {
		let parsed: unknown;

		try {
			parsed = JSON.parse(event.data);
		} catch {
			return;
		}

		if (!MessageValidator.isServerToClientMessage(parsed)) {
			return;
		}

		this.messages.update((messages) => [...messages, parsed]);

		this.handleIncoming(parsed);
	}
}
