/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CLIENT_TO_SERVER_TYPES, SERVER_TO_CLIENT_TYPES, type ClientToServer, type ServerToClient } from './message-types';

/**
 * Current protocol version used for client-server communication.
 */
export const PROTOCOL_VERSION = '1.0.0' as const;

type RecordValue = Record<string, unknown>;

/**
 * Validates protocol message discriminators at runtime.
 *
 * The validator checks only whether a message declares a known `type`.
 * Payload structure and payload values are not validated.
 */
export class MessageValidator {
	/**
	 * Checks whether a value declares a known client-to-server message type.
	 *
	 * @param message - Value to inspect.
	 * @returns True when the value declares a supported client-to-server type.
	 */
	public static isClientToServerMessage(message: unknown): message is ClientToServer {
		if (!this.isRecord(message)) {
			return false;
		}

		const type = message['type'];

		if (!this.isKnownType(type, CLIENT_TO_SERVER_TYPES)) {
			return false;
		}

		const payload = message['payload'];

		if (!this.isRecord(payload)) {
			return false;
		}

		switch (type) {
			case 'loco.command.drive':
				return this.isLocoDrive(payload);

			case 'loco.command.eStop':
				return this.hasRequestId(payload) && this.isLocoAddress(payload['addr']);

			case 'loco.command.function.set':
				return (
					this.hasRequestId(payload) &&
					this.isLocoAddress(payload['addr']) &&
					this.isFunctionNumber(payload['fn']) &&
					typeof payload['on'] === 'boolean'
				);

			case 'loco.command.function.toggle':
				return this.hasRequestId(payload) && this.isLocoAddress(payload['addr']) && this.isFunctionNumber(payload['fn']);

			case 'loco.command.stop.all':
				return this.hasRequestId(payload);

			case 'programming.command.cv.read':
				return this.hasRequestId(payload) && this.isCvAddress(payload['cvAddress']);

			case 'programming.command.cv.write':
				return this.hasRequestId(payload) && this.isCvAddress(payload['cvAddress']) && this.isByte(payload['cvValue']);

			case 'programming.command.pom.cv.read':
				return this.hasRequestId(payload) && this.isLocoAddress(payload['address']) && this.isCvAddress(payload['cvAddress']);

			case 'programming.command.pom.cv.write':
				return (
					this.hasRequestId(payload) &&
					this.isLocoAddress(payload['address']) &&
					this.isCvAddress(payload['cvAddress']) &&
					this.isByte(payload['cvValue'])
				);

			case 'server.command.session.hello':
				return (
					this.hasRequestId(payload) &&
					typeof payload['protocolVersion'] === 'string' &&
					(payload['clientName'] === undefined || typeof payload['clientName'] === 'string')
				);

			case 'switching.command.turnout.set':
				return this.isTurnoutSet(payload);

			case 'system.command.trackpower.set':
				return this.hasRequestId(payload) && typeof payload['powerOn'] === 'boolean';
		}

		return false;
	}

	/**
	 * Checks whether a value declares a known server-to-client message type.
	 *
	 * @param message - Value to inspect.
	 * @returns True when the value declares a supported server-to-client type.
	 */
	public static isServerToClientMessage(message: unknown): message is ServerToClient {
		if (!this.isRecord(message)) {
			return false;
		}

		return this.isKnownType(message['type'], SERVER_TO_CLIENT_TYPES);
	}

	private static isLocoDrive(payload: RecordValue): boolean {
		return (
			this.hasRequestId(payload) &&
			this.isLocoAddress(payload['addr']) &&
			this.isIntegerInRange(payload['speedStep'], 0, 126) &&
			this.isDirection(payload['dir']) &&
			(payload['steps'] === undefined || payload['steps'] === 14 || payload['steps'] === 28 || payload['steps'] === 128)
		);
	}

	private static isTurnoutSet(payload: RecordValue): boolean {
		return (
			this.hasRequestId(payload) &&
			this.isIntegerInRange(payload['addr'], 0, 16383) &&
			(payload['state'] === 'STRAIGHT' || payload['state'] === 'DIVERGING') &&
			(payload['pulseMs'] === undefined || this.isIntegerInRange(payload['pulseMs'], 0, 60_000))
		);
	}

	private static hasRequestId(payload: RecordValue): boolean {
		return typeof payload['requestId'] === 'string' && payload['requestId'].length > 0;
	}

	private static isLocoAddress(value: unknown): boolean {
		return this.isIntegerInRange(value, 1, 9999);
	}

	private static isCvAddress(value: unknown): boolean {
		return this.isIntegerInRange(value, 1, 1024);
	}

	private static isFunctionNumber(value: unknown): boolean {
		return this.isIntegerInRange(value, 0, 31);
	}

	private static isByte(value: unknown): boolean {
		return this.isIntegerInRange(value, 0, 255);
	}

	private static isDirection(value: unknown): boolean {
		return value === 'FWD' || value === 'REV';
	}

	private static isIntegerInRange(value: unknown, min: number, max: number): boolean {
		return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
	}

	private static isRecord(value: unknown): value is RecordValue {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	private static isKnownType<T extends Record<string, true>>(type: unknown, knownTypes: T): type is keyof T & string {
		return typeof type === 'string' && Object.hasOwn(knownTypes, type);
	}
}
