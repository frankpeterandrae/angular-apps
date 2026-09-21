/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */
import * as dgram from 'node:dgram';
import { EventEmitter } from 'node:events';

import { type Logger } from '@application-platform/z21-shared';

/**
 * Remote endpoint of a received Z21 UDP datagram.
 */
export type Z21UdpFrom = { address: string; port: number };

/**
 * Datagram received from the Z21 UDP transport.
 */
export type Z21UdpDatagram = {
	from: Z21UdpFrom;
	raw: Buffer;
	rawHex: string;
};

/**
 * Z21 UDP transport for sending and receiving datagrams.
 */
export class Z21Udp extends EventEmitter {
	private sock = dgram.createSocket({
		type: 'udp4',
		reuseAddr: true
	});

	private started = false;

	constructor(
		private readonly host: string,
		private readonly port: number,
		private readonly logger: Logger
	) {
		super();
	}

	/**
	 * Starts listening for Z21 UDP datagrams.
	 *
	 * @param listenPort - Local UDP port.
	 */
	public start(listenPort = 21105): void {
		if (this.started) {
			return;
		}

		this.started = true;

		this.sock.on('message', (message: Buffer, remoteInfo: dgram.RemoteInfo) => {
			const from = {
				address: remoteInfo.address,
				port: remoteInfo.port
			};

			const rawHex = this.toHex(message);

			this.logger.debug('[udp] rx <-', {
				from,
				len: message.length,
				hex: rawHex
			});

			this.emit('datagram', {
				from,
				raw: message,
				rawHex
			} satisfies Z21UdpDatagram);
		});

		this.sock.bind(listenPort);
	}

	/**
	 * Stops the UDP socket.
	 */
	public stop(): void {
		if (!this.started) {
			return;
		}

		this.started = false;

		try {
			this.sock.close();
		} catch (error) {
			this.emit('error', error instanceof Error ? error : new Error(String(error)));
		} finally {
			this.sock.removeAllListeners();

			this.sock = dgram.createSocket({
				type: 'udp4',
				reuseAddr: true
			});
		}
	}

	/**
	 * Sends a raw datagram to the configured Z21.
	 *
	 * @param buffer - Datagram payload.
	 */
	public sendRaw(buffer: Buffer): void {
		this.logger.debug('[udp] tx', {
			to: {
				address: this.host,
				port: this.port
			},
			len: buffer.length,
			hex: this.toHex(buffer)
		});

		this.sock.send(buffer, this.port, this.host);
	}

	private toHex(buf: Uint8Array, maxBytes = 512): string {
		const len = Math.min(buf.length, maxBytes);
		let out = '';
		for (let i = 0; i < len; i++) out += buf[i].toString(16).padStart(2, '0');
		return buf.length > maxBytes ? out + '…' : out;
	}
}
