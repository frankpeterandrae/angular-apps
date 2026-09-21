/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import * as dgram from 'node:dgram';

import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import type { Logger } from '@application-platform/z21-shared';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { Z21Udp } from './udp';

vi.mock('node:dgram', () => ({
	createSocket: vi.fn(() => ({
		on: vi.fn(),
		bind: vi.fn(),
		send: vi.fn(),
		close: vi.fn(),
		removeAllListeners: vi.fn()
	}))
}));

type MockSocket = {
	on: Mock;
	bind: Mock;
	send: Mock;
	close: Mock;
	removeAllListeners: Mock;
};

type Services = {
	logger: DeepMocked<Logger>;
	socket: MockSocket;
	udp: Z21Udp;
};

describe('Z21Udp', () => {
	let services: Services;

	function getCreatedSocket(index = 0): MockSocket {
		return (dgram.createSocket as Mock).mock.results[index].value as MockSocket;
	}

	function createServices(host = 'host', port = 1234): Services {
		const logger = DeepMock<Logger>();
		const udp = new Z21Udp(host, port, logger);
		const socket = getCreatedSocket();

		return {
			logger,
			socket,
			udp
		};
	}

	function getMessageHandler(socket: MockSocket): (message: Buffer, remoteInfo: dgram.RemoteInfo) => void {
		const call = socket.on.mock.calls.find(([event]) => event === 'message');

		return call?.[1];
	}

	beforeEach(() => {
		vi.resetAllMocks();
		services = createServices();
	});

	describe('start', () => {
		it('binds the socket to the default listen port', () => {
			services.udp.start();

			expect(services.socket.on).toHaveBeenCalledWith('message', expect.any(Function));

			expect(services.socket.bind).toHaveBeenCalledWith(21105);
		});

		it('binds the socket to a custom listen port', () => {
			services.udp.start(54321);

			expect(services.socket.bind).toHaveBeenCalledWith(54321);
		});

		it('does not start twice', () => {
			services.udp.start();
			services.udp.start();

			expect(services.socket.bind).toHaveBeenCalledTimes(1);

			expect(services.socket.on).toHaveBeenCalledTimes(1);
		});

		it('emits received datagrams', () => {
			services.udp.start();

			const handler = getMessageHandler(services.socket);

			const message = Buffer.from([0x04, 0x00, 0x10, 0x00]);

			const listener = vi.fn();

			services.udp.on('datagram', listener);

			handler(message, {
				address: '192.168.0.111',
				port: 21105
			} as dgram.RemoteInfo);

			expect(listener).toHaveBeenCalledWith({
				from: {
					address: '192.168.0.111',
					port: 21105
				},
				raw: message,
				rawHex: '04001000'
			});
		});

		it('logs received datagrams', () => {
			services.udp.start();

			const handler = getMessageHandler(services.socket);

			handler(Buffer.from([0xaa, 0xbb]), {
				address: '192.168.0.111',
				port: 21105
			} as dgram.RemoteInfo);

			expect(services.logger.debug).toHaveBeenCalledWith('[udp] rx <-', {
				from: {
					address: '192.168.0.111',
					port: 21105
				},
				len: 2,
				hex: 'aabb'
			});
		});
	});

	describe('sendRaw', () => {
		it('sends the datagram to the configured endpoint', () => {
			const buffer = Buffer.from([0x01, 0x02, 0x03]);

			services.udp.sendRaw(buffer);

			expect(services.socket.send).toHaveBeenCalledWith(buffer, 1234, 'host');
		});

		it('logs the target endpoint and payload', () => {
			const buffer = Buffer.from([0xaa, 0xbb]);

			services.udp.sendRaw(buffer);

			expect(services.logger.debug).toHaveBeenCalledWith('[udp] tx', {
				to: {
					address: 'host',
					port: 1234
				},
				len: 2,
				hex: 'aabb'
			});
		});
	});

	describe('stop', () => {
		it('does nothing when not started', () => {
			services.udp.stop();

			expect(services.socket.close).not.toHaveBeenCalled();
		});

		it('closes the socket and removes its listeners', () => {
			services.udp.start();

			services.udp.stop();

			expect(services.socket.close).toHaveBeenCalledOnce();

			expect(services.socket.removeAllListeners).toHaveBeenCalledOnce();
		});

		it('emits close errors', () => {
			const listener = vi.fn();
			const error = new Error('close failed');

			services.udp.start();
			services.udp.on('error', listener);

			services.socket.close.mockImplementationOnce(() => {
				throw error;
			});

			services.udp.stop();

			expect(listener).toHaveBeenCalledWith(error);
		});

		it('can be started again after stopping', () => {
			services.udp.start();

			services.udp.stop();

			const recreatedSocket = getCreatedSocket(1);

			services.udp.start();

			expect(recreatedSocket.bind).toHaveBeenCalledWith(21105);

			expect(recreatedSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
		});
	});
});
