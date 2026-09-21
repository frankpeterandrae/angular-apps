/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CLIENT_TO_SERVER_TYPES, SERVER_TO_CLIENT_TYPES } from './message-types';
import { MessageValidator } from './messages';

describe('MessageValidator', () => {
	describe('isClientToServerMessage', () => {
		it('rejects known server-to-client message types', () => {
			for (const type of Object.keys(SERVER_TO_CLIENT_TYPES)) {
				expect(MessageValidator.isClientToServerMessage({ type })).toBe(false);
			}
		});

		it.each([
			null,
			undefined,
			42,
			'message',
			true,
			{},
			{ payload: {} },
			{ type: null },
			{ type: undefined },
			{ type: 42 },
			{ type: '' },
			{ type: 'unknown.message' }
		])('rejects invalid value %p', (value) => {
			expect(MessageValidator.isClientToServerMessage(value)).toBe(false);
		});

		it('accepts a valid locomotive drive command', () => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.drive',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						speedStep: 47,
						dir: 'FWD',
						steps: 128
					}
				})
			).toBe(true);
		});

		it('rejects the legacy speed property', () => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.drive',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						speed: 47,
						dir: 'FWD'
					}
				})
			).toBe(false);
		});

		it.each([-1, 127, 1.5])('rejects invalid speed step %s', (speedStep) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.drive',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						speedStep,
						dir: 'FWD'
					}
				})
			).toBe(false);
		});
	});

	describe('isServerToClientMessage', () => {
		it.each(Object.keys(SERVER_TO_CLIENT_TYPES))('accepts known server-to-client type %s', (type) => {
			expect(MessageValidator.isServerToClientMessage({ type })).toBe(true);
		});

		it('rejects known client-to-server message types', () => {
			for (const type of Object.keys(CLIENT_TO_SERVER_TYPES)) {
				expect(MessageValidator.isServerToClientMessage({ type })).toBe(false);
			}
		});

		it.each([
			null,
			undefined,
			42,
			'message',
			true,
			{},
			{ payload: {} },
			{ type: null },
			{ type: undefined },
			{ type: 42 },
			{ type: '' },
			{ type: 'unknown.message' }
		])('rejects invalid value %p', (value) => {
			expect(MessageValidator.isServerToClientMessage(value)).toBe(false);
		});

		it('validates only the message discriminator', () => {
			expect(
				MessageValidator.isServerToClientMessage({
					type: 'system.message.trackpower'
				})
			).toBe(true);
		});
	});
});
