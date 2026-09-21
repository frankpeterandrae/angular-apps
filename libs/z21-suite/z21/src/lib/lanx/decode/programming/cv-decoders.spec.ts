/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type CvNackEvent, type CvResultEvent } from '@application-platform/z21-shared';

import { LanXCvNackDecoder } from './cv-nack';
import { LanXCvResultDecoder } from './cv-result';

describe('CV programming decoders', () => {
	describe('LanXCvNackDecoder', () => {
		const decoder = new LanXCvNackDecoder();

		it.each([
			{
				command: 'LAN_X_CV_NACK',
				shortCircuit: false
			},
			{
				command: 'LAN_X_CV_NACK_SC',
				shortCircuit: true
			}
		] as const)('decodes $command', ({ command, shortCircuit }) => {
			expect(decoder.decode(command)).toEqual<CvNackEvent[]>([
				{
					event: Z21EventName.CV_NACK,
					payload: {
						shortCircuit,
						raw: []
					}
				}
			]);
		});

		it('returns no event for unsupported commands', () => {
			expect(decoder.decode('LAN_X_GET_VERSION')).toEqual([]);
		});
	});

	describe('LanXCvResultDecoder', () => {
		let decoder: LanXCvResultDecoder;

		beforeEach(() => {
			decoder = new LanXCvResultDecoder();
		});

		it.each([
			{
				payload: [0x14, 0x00, 0x00, 0x03],
				cv: 1,
				value: 3
			},
			{
				payload: [0x14, 0x00, 0x1c, 0x2a],
				cv: 29,
				value: 42
			},
			{
				payload: [0x14, 0x03, 0xff, 0x64],
				cv: 1024,
				value: 100
			}
		])('decodes CV $cv', ({ payload, cv, value }) => {
			const [event] = decoder.decode(Uint8Array.from(payload));

			expect(event.event).toBe(Z21EventName.CV_RESULT);
			expect(event.payload.cv).toBe(cv);
			expect(event.payload.value).toBe(value);
		});

		it('preserves the raw payload', () => {
			const payload = Uint8Array.from([0x14, 0x00, 0x1c, 0x2a]);

			expect(decoder.decode(payload)).toEqual<CvResultEvent[]>([
				{
					event: Z21EventName.CV_RESULT,
					payload: {
						cv: 29,
						value: 42,
						raw: [0x14, 0x00, 0x1c, 0x2a]
					}
				}
			]);
		});

		it('returns no event for incomplete data', () => {
			expect(decoder.decode(Uint8Array.from([0x14]))).toEqual([]);
		});
	});
});
