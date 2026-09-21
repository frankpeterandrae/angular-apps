/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { CLIENT_TO_SERVER_TYPES, SERVER_TO_CLIENT_TYPES } from './message-types';
import { MessageValidator } from './messages';

describe('MessageValidator', () => {
	describe('isClientToServerMessage', () => {
		it.each([
			{
				type: 'loco.command.drive',
				payload: {
					requestId: 'req-1',
					addr: 1845,
					speedStep: 47,
					dir: 'FWD',
					steps: 128
				}
			},
			{
				type: 'loco.command.eStop',
				payload: {
					requestId: 'req-1',
					addr: 1845
				}
			},
			{
				type: 'loco.command.function.set',
				payload: {
					requestId: 'req-1',
					addr: 1845,
					fn: 3,
					on: true
				}
			},
			{
				type: 'loco.command.function.toggle',
				payload: {
					requestId: 'req-1',
					addr: 1845,
					fn: 3
				}
			},
			{
				type: 'loco.command.stop.all',
				payload: {
					requestId: 'req-1'
				}
			},
			{
				type: 'programming.command.cv.read',
				payload: {
					requestId: 'req-1',
					cvAddress: 29
				}
			},
			{
				type: 'programming.command.cv.write',
				payload: {
					requestId: 'req-1',
					cvAddress: 29,
					cvValue: 42
				}
			},
			{
				type: 'programming.command.pom.cv.read',
				payload: {
					requestId: 'req-1',
					address: 1845,
					cvAddress: 29
				}
			},
			{
				type: 'programming.command.pom.cv.write',
				payload: {
					requestId: 'req-1',
					address: 1845,
					cvAddress: 29,
					cvValue: 42
				}
			},
			{
				type: 'server.command.session.hello',
				payload: {
					requestId: 'req-1',
					protocolVersion: '1.0.0',
					clientName: 'ui'
				}
			},
			{
				type: 'switching.command.turnout.set',
				payload: {
					requestId: 'req-1',
					addr: 12,
					state: 'STRAIGHT',
					pulseMs: 200
				}
			},
			{
				type: 'system.command.trackpower.set',
				payload: {
					requestId: 'req-1',
					powerOn: true
				}
			}
		])('accepts valid client message $type', (message) => {
			expect(MessageValidator.isClientToServerMessage(message)).toBe(true);
		});

		it.each([
			null,
			undefined,
			42,
			'message',
			true,
			[],
			{},
			{ payload: {} },
			{ type: null },
			{ type: undefined },
			{ type: 42 },
			{ type: '' },
			{ type: 'unknown.message' },
			{
				type: 'loco.command.drive',
				payload: null
			}
		])('rejects invalid value %p', (value) => {
			expect(MessageValidator.isClientToServerMessage(value)).toBe(false);
		});

		it('rejects known server-to-client message types', () => {
			for (const type of Object.keys(SERVER_TO_CLIENT_TYPES)) {
				expect(MessageValidator.isClientToServerMessage({ type })).toBe(false);
			}
		});

		it.each(['', undefined, 42])('rejects invalid requestId %p', (requestId) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.stop.all',
					payload: {
						requestId
					}
				})
			).toBe(false);
		});

		it.each([
			[0, false],
			[1, true],
			[9999, true],
			[10000, false],
			[1.5, false]
		])('validates locomotive address %p', (addr, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.eStop',
					payload: {
						requestId: 'req-1',
						addr
					}
				})
			).toBe(expected);
		});

		it.each([
			[-1, false],
			[0, true],
			[126, true],
			[127, false],
			[1.5, false]
		])('validates speedStep %p', (speedStep, expected) => {
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
			).toBe(expected);
		});

		it.each([
			['FWD', true],
			['REV', true],
			['LEFT', false],
			[1, false]
		])('validates direction %p', (dir, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.drive',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						speedStep: 42,
						dir
					}
				})
			).toBe(expected);
		});

		it.each([
			[undefined, true],
			[14, true],
			[28, true],
			[128, true],
			[27, false]
		])('validates speed steps mode %p', (steps, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.drive',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						speedStep: 42,
						dir: 'FWD',
						steps
					}
				})
			).toBe(expected);
		});

		it.each([
			[-1, false],
			[0, true],
			[31, true],
			[32, false],
			[1.5, false]
		])('validates function number %p', (fn, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.function.set',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						fn,
						on: true
					}
				})
			).toBe(expected);
		});

		it('rejects non-boolean function state', () => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'loco.command.function.set',
					payload: {
						requestId: 'req-1',
						addr: 1845,
						fn: 3,
						on: 1
					}
				})
			).toBe(false);
		});

		it.each([
			[0, false],
			[1, true],
			[1024, true],
			[1025, false],
			[1.5, false]
		])('validates CV address %p', (cvAddress, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'programming.command.cv.read',
					payload: {
						requestId: 'req-1',
						cvAddress
					}
				})
			).toBe(expected);
		});

		it.each([
			[-1, false],
			[0, true],
			[255, true],
			[256, false],
			[1.5, false]
		])('validates CV value %p', (cvValue, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'programming.command.cv.write',
					payload: {
						requestId: 'req-1',
						cvAddress: 29,
						cvValue
					}
				})
			).toBe(expected);
		});

		it.each([
			[-1, false],
			[0, true],
			[16383, true],
			[16384, false],
			[1.5, false]
		])('validates turnout address %p', (addr, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'switching.command.turnout.set',
					payload: {
						requestId: 'req-1',
						addr,
						state: 'STRAIGHT'
					}
				})
			).toBe(expected);
		});

		it.each([
			['STRAIGHT', true],
			['DIVERGING', true],
			['UNKNOWN', false]
		])('validates turnout state %p', (state, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'switching.command.turnout.set',
					payload: {
						requestId: 'req-1',
						addr: 12,
						state
					}
				})
			).toBe(expected);
		});

		it.each([
			[undefined, true],
			[0, true],
			[60_000, true],
			[-1, false],
			[60_001, false],
			[1.5, false]
		])('validates turnout pulse %p', (pulseMs, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'switching.command.turnout.set',
					payload: {
						requestId: 'req-1',
						addr: 12,
						state: 'STRAIGHT',
						pulseMs
					}
				})
			).toBe(expected);
		});

		it.each([
			[undefined, true],
			['ui', true],
			[42, false]
		])('validates optional clientName %p', (clientName, expected) => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'server.command.session.hello',
					payload: {
						requestId: 'req-1',
						protocolVersion: '1.0.0',
						clientName
					}
				})
			).toBe(expected);
		});

		it('rejects invalid protocol version', () => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'server.command.session.hello',
					payload: {
						requestId: 'req-1',
						protocolVersion: 1
					}
				})
			).toBe(false);
		});

		it('rejects invalid track power state', () => {
			expect(
				MessageValidator.isClientToServerMessage({
					type: 'system.command.trackpower.set',
					payload: {
						requestId: 'req-1',
						powerOn: 1
					}
				})
			).toBe(false);
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
			[],
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

		it('validates only the server-to-client discriminator', () => {
			expect(
				MessageValidator.isServerToClientMessage({
					type: 'system.message.trackpower'
				})
			).toBe(true);
		});
	});
});
