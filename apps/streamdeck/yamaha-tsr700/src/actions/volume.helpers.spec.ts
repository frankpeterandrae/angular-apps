import { describe, expect, it } from 'vitest';

import type { ZoneStatus } from '../yamaha';

import { createVolumeImage, getVolumeKnobY, hasReachedVolumeLimit } from './volume.helpers';

describe('volume helpers', () => {
	const status = (actualVolume: number): ZoneStatus => ({
		power: 'On',
		actualVolume
	});

	describe('getVolumeKnobY', () => {
		it('places 0 dB at the top of the upper button', () => {
			expect(getVolumeKnobY(status(0), 'up')).toBe(18);
		});

		it('places -40 dB at the bottom of the upper button', () => {
			expect(getVolumeKnobY(status(-40), 'up')).toBe(126);
		});

		it('does not show the knob on the upper button below -40 dB', () => {
			expect(getVolumeKnobY(status(-40.5), 'up')).toBeUndefined();
		});

		it('places -40 dB at the top of the lower button', () => {
			expect(getVolumeKnobY(status(-40), 'down')).toBe(18);
		});

		it('places -80 dB at the bottom of the lower button', () => {
			expect(getVolumeKnobY(status(-80), 'down')).toBe(126);
		});

		it('does not show the knob on the lower button above -40 dB', () => {
			expect(getVolumeKnobY(status(-39.5), 'down')).toBeUndefined();
		});

		it('places -20 dB in the middle of the upper button', () => {
			expect(getVolumeKnobY(status(-20), 'up')).toBe(72);
		});

		it('places -60 dB in the middle of the lower button', () => {
			expect(getVolumeKnobY(status(-60), 'down')).toBe(72);
		});

		it('clamps values above 0 dB', () => {
			expect(getVolumeKnobY(status(10), 'up')).toBe(18);
		});

		it('clamps values below -80 dB', () => {
			expect(getVolumeKnobY(status(-100), 'down')).toBe(126);
		});

		it('uses -80 dB as fallback when actual volume is missing', () => {
			expect(getVolumeKnobY({ power: 'On' }, 'down')).toBe(126);
		});
	});

	describe('hasReachedVolumeLimit', () => {
		it('detects max volume for volume up', () => {
			expect(hasReachedVolumeLimit(status(0), 'up')).toBe(true);
		});

		it('does not detect max volume below 0 dB', () => {
			expect(hasReachedVolumeLimit(status(-0.5), 'up')).toBe(false);
		});

		it('detects min volume for volume down', () => {
			expect(hasReachedVolumeLimit(status(-80), 'down')).toBe(true);
		});

		it('does not detect min volume above -80 dB', () => {
			expect(hasReachedVolumeLimit(status(-79.5), 'down')).toBe(false);
		});

		it('does not stop when no status is available', () => {
			expect(hasReachedVolumeLimit(undefined, 'up')).toBe(false);
		});

		it('does not stop when actual volume is missing', () => {
			expect(hasReachedVolumeLimit({ power: 'On' }, 'down')).toBe(false);
		});
	});

	describe('createVolumeImage', () => {
		it('creates a svg data uri', () => {
			const image = createVolumeImage(status(-40), 'up');

			expect(image).toMatch(/^data:image\/svg\+xml;utf8,/);
		});

		it('contains the fader track', () => {
			const image = decodeURIComponent(createVolumeImage(status(-40), 'up'));

			expect(image).toContain('<rect x="65" y="18" width="14" height="108"');
			expect(image).toContain('<rect x="70" y="26" width="4" height="92"');
		});

		it('contains the knob when it is visible', () => {
			const image = decodeURIComponent(createVolumeImage(status(-40), 'up'));

			expect(image).toContain('<rect x="56" y="120" width="32" height="12"');
		});

		it('does not contain the knob when it is not visible for the upper button', () => {
			const image = decodeURIComponent(createVolumeImage(status(-60), 'up'));

			expect(image).not.toContain('<rect x="56"');
		});

		it('does not contain the knob when it is not visible for the lower button', () => {
			const image = decodeURIComponent(createVolumeImage(status(-20), 'down'));

			expect(image).not.toContain('<rect x="56"');
		});
	});
});
