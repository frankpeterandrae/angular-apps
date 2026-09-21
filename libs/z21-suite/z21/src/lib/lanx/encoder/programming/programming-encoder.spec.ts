import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';

import type { Z21Codec } from '../../../codec/codec';

import { ProgrammingEncoder } from './programming-encoder';

describe('ProgrammingEncoder', () => {
	let codec: DeepMocked<Z21Codec>;
	let encoder: ProgrammingEncoder;

	beforeEach(() => {
		codec = DeepMock<Z21Codec>();
		encoder = new ProgrammingEncoder(codec);
	});

	describe('readCv', () => {
		it('encodes a CV read command', () => {
			codec.encodeCvAddress.mockReturnValue({
				adrMsb: 0x00,
				adrLsb: 0x1c
			});

			encoder.readCv(29);

			expect(codec.encodeCvAddress).toHaveBeenCalledWith(29);
			expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_CV_READ', [0x00, 0x1c]);
		});
	});

	describe('writeCv', () => {
		it('encodes CV address and value', () => {
			codec.encodeCvAddress.mockReturnValue({
				adrMsb: 0x00,
				adrLsb: 0x1c
			});

			encoder.writeCv(29, 42);

			expect(codec.encodeLanX).toHaveBeenCalledWith('LAN_X_CV_WRITE', [0x00, 0x1c, 42]);
		});
	});

	describe('validation', () => {
		it.each([0, 1025])('rejects CV address %s', (cvAddress) => {
			expect(() => encoder.readCv(cvAddress)).toThrow('out of range');
		});

		it.each([-1, 256])('rejects CV value %s', (cvValue) => {
			expect(() => encoder.writeCv(1, cvValue)).toThrow('out of range');
		});
	});

	describe('POM', () => {
		it('encodes zero-based POM CV read address', () => {
			expect(encoder.readPomCv(1024)).toEqual(Uint8Array.from([0xff, 0x03]));
		});

		it('encodes zero-based POM CV write payload', () => {
			expect(encoder.writePomCv(29, 42)).toEqual(Uint8Array.from([0x1c, 0x00, 0x2a]));
		});
	});
});
