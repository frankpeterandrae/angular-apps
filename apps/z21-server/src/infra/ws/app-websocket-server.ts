/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { MessageValidator, PROTOCOL_VERSION, type ClientToServer, type ServerToClient } from '@application-platform/protocol';
import type { ConnectHandler, WsServer } from '@application-platform/server-utils';
import type { Logger } from '@application-platform/z21-shared';
import type { WebSocket as WsWebSocket } from 'ws';

/** Handles validated client protocol messages. */
export type MessageHandler = (message: ClientToServer, ws: WsWebSocket) => void | Promise<void>;

/** Handles client disconnects. */
export type DisconnectHandler = (ws: WsWebSocket) => void;

/**
 * Adapts raw WebSocket connections to the application protocol.
 *
 * Parses and validates incoming messages and sends the initial session-ready response.
 */
export class AppWsServer {
	constructor(
		private readonly wsServer: WsServer,
		private readonly logger: Logger
	) {}

	/**
	 * Registers application handlers for WebSocket connection events.
	 *
	 * @param onMessage - Handler for validated client messages.
	 * @param onDisconnect - Optional disconnect handler.
	 * @param onConnect - Optional connect handler.
	 */
	public onConnection(onMessage: MessageHandler, onDisconnect?: DisconnectHandler, onConnect?: ConnectHandler): void {
		this.wsServer.onConnection(
			(data, ws) => {
				this.handleMessage(data, ws, onMessage);
			},
			(ws) => {
				onDisconnect?.(ws);
			},
			(ws) => {
				this.sendSessionReady(ws);
				onConnect?.(ws);
			}
		);
	}

	/**
	 * Sends a protocol message to one client.
	 *
	 * @param ws - Target client.
	 * @param message - Message to send.
	 */
	public sendToClient(ws: WsWebSocket, message: ServerToClient): void {
		this.wsServer.send(ws, message);
	}

	/**
	 * Broadcasts a protocol message to all connected clients.
	 *
	 * @param message - Message to broadcast.
	 */
	public broadcast(message: ServerToClient): void {
		this.wsServer.broadcast(message);
	}

	/**
	 * Closes the underlying WebSocket server.
	 */
	public close(): void {
		this.wsServer.close();
	}

	private handleMessage(data: string, ws: WsWebSocket, onMessage: MessageHandler): void {
		this.logger.debug('ws.message.raw', { data });

		let message: unknown;

		try {
			message = JSON.parse(data);
		} catch (error) {
			this.logger.debug('ws.message.rejected', {
				reason: 'invalid json',
				error
			});

			return;
		}

		if (!MessageValidator.isClientToServerMessage(message)) {
			this.logger.info('ws.message.rejected', {
				message,
				reason: 'invalid message'
			});

			return;
		}

		this.logger.info('ws.message.accepted', {
			type: message.type
		});

		void Promise.resolve(onMessage(message, ws)).catch((error) => {
			this.logger.error('ws.message.failed', {
				type: message.type,
				error
			});
		});
	}

	private sendSessionReady(ws: WsWebSocket): void {
		this.sendToClient(ws, {
			type: 'server.replay.session.ready',
			payload: {
				protocolVersion: PROTOCOL_VERSION,
				serverTime: new Date().toISOString(),
				requestId: ''
			}
		});
	}
}
