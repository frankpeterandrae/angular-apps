/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { PROTOCOL_VERSION, type ClientToServer } from '@application-platform/protocol';
import type { WsServer } from '@application-platform/server-utils';
import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import type { Logger } from '@application-platform/z21-shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WebSocket as WsWebSocket } from 'ws';

import { AppWsServer } from './app-websocket-server';

describe('AppWsServer', () => {
	let wsServer: DeepMocked<WsServer>;
	let logger: DeepMocked<Logger>;
	let server: AppWsServer;

	const ws = {} as WsWebSocket;

	function connectionHandlers(): {
		onMessage: (data: string, ws: WsWebSocket) => void;
		onDisconnect: ((ws: WsWebSocket) => void) | undefined;
		onConnect: ((ws: WsWebSocket) => void) | undefined;
	} {
		const [onMessage, onDisconnect, onConnect] = wsServer.onConnection.mock.calls[0];

		return {
			onMessage,
			onDisconnect,
			onConnect
		};
	}

	beforeEach(() => {
		wsServer = DeepMock<WsServer>();

		logger = DeepMock<Logger>();

		server = new AppWsServer(wsServer, logger);
	});

	it('sends session-ready before invoking the connect handler', () => {
		const callOrder: string[] = [];

		wsServer.send.mockImplementation(() => {
			callOrder.push('ready');
		});

		const onConnect = vi.fn(() => {
			callOrder.push('connect');
		});

		server.onConnection(vi.fn(), undefined, onConnect);

		const handlers = connectionHandlers();

		handlers.onConnect?.(ws);

		expect(wsServer.send).toHaveBeenCalledWith(ws, {
			type: 'server.replay.session.ready',
			payload: {
				protocolVersion: PROTOCOL_VERSION,
				serverTime: expect.any(String),
				requestId: ''
			}
		});

		expect(callOrder).toEqual(['ready', 'connect']);
	});

	it('forwards valid protocol messages', () => {
		const onMessage = vi.fn();

		const message: ClientToServer = {
			type: 'system.command.trackpower.set',
			payload: {
				powerOn: true,
				requestId: 'req-1'
			}
		};

		server.onConnection(onMessage);

		connectionHandlers().onMessage(JSON.stringify(message), ws);

		expect(onMessage).toHaveBeenCalledWith(message, ws);

		expect(logger.info).toHaveBeenCalledWith('ws.message.accepted', {
			type: message.type
		});
	});

	it('rejects malformed JSON', () => {
		const onMessage = vi.fn();

		server.onConnection(onMessage);

		connectionHandlers().onMessage('not-json', ws);

		expect(onMessage).not.toHaveBeenCalled();

		expect(logger.debug).toHaveBeenCalledWith(
			'ws.message.rejected',
			expect.objectContaining({
				reason: 'invalid json'
			})
		);
	});

	it('rejects JSON that is not a valid client protocol message', () => {
		const onMessage = vi.fn();

		server.onConnection(onMessage);

		connectionHandlers().onMessage(
			JSON.stringify({
				type: 'invalid.message'
			}),
			ws
		);

		expect(onMessage).not.toHaveBeenCalled();

		expect(logger.info).toHaveBeenCalledWith('ws.message.rejected', {
			message: {
				type: 'invalid.message'
			},
			reason: 'invalid message'
		});
	});

	it('invokes the disconnect handler', () => {
		const onDisconnect = vi.fn();

		server.onConnection(vi.fn(), onDisconnect);

		connectionHandlers().onDisconnect?.(ws);

		expect(onDisconnect).toHaveBeenCalledWith(ws);
	});

	it('logs rejected asynchronous message handlers', async () => {
		const error = new Error('handler failed');

		const onMessage = vi.fn().mockRejectedValue(error);

		const message: ClientToServer = {
			type: 'system.command.trackpower.set',
			payload: {
				powerOn: true,
				requestId: 'req-1'
			}
		};

		server.onConnection(onMessage);

		connectionHandlers().onMessage(JSON.stringify(message), ws);

		await vi.waitFor(() => {
			expect(logger.error).toHaveBeenCalledWith('ws.message.failed', {
				type: message.type,
				error
			});
		});
	});

	it('delegates sendToClient to the underlying server', () => {
		const message = {
			type: 'server.replay.session.ready',
			payload: {
				protocolVersion: PROTOCOL_VERSION,
				serverTime: '2026-01-01T00:00:00.000Z',
				requestId: 'req-1'
			}
		} as const;

		server.sendToClient(ws, message);

		expect(wsServer.send).toHaveBeenCalledWith(ws, message);
	});

	it('delegates broadcast to the underlying server', () => {
		const message = {
			type: 'server.replay.session.ready',
			payload: {
				protocolVersion: PROTOCOL_VERSION,
				serverTime: '2026-01-01T00:00:00.000Z',
				requestId: 'req-1'
			}
		} as const;

		server.broadcast(message);

		expect(wsServer.broadcast).toHaveBeenCalledWith(message);
	});

	it('delegates close to the underlying server', () => {
		server.close();

		expect(wsServer.close).toHaveBeenCalledOnce();
	});
});
