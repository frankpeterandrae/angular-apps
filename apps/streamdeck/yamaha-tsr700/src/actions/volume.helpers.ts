import type { VolumeDirection, ZoneStatus } from '../yamaha';

/** dB range and pixel bounds for one half of the two-key fader. */
export interface VolumeFaderOptions {
	minDb?: number;
	splitDb?: number;
	maxDb?: number;
	faderTop?: number;
	faderBottom?: number;
}

/** Checks the known dB volume against the direction-specific limit; unknown volume does not block a command. */
export function hasReachedVolumeLimit(status: ZoneStatus | undefined, direction: VolumeDirection, minDb = -80, maxDb = 0): boolean {
	if (status?.actualVolume === undefined) {
		return false;
	}

	if (direction === 'up') {
		return status.actualVolume >= maxDb;
	}

	return status.actualVolume <= minDb;
}

/** Maps the dB volume to one half of a two-key fader; the knob is hidden outside that half. */
export function getVolumeKnobY(status: ZoneStatus, direction: VolumeDirection, options: VolumeFaderOptions = {}): number | undefined {
	const minDb = options.minDb ?? -80;
	const splitDb = options.splitDb ?? -40;
	const maxDb = options.maxDb ?? 0;

	const faderTop = options.faderTop ?? 18;
	const faderBottom = options.faderBottom ?? 126;
	const faderHeight = faderBottom - faderTop;

	const actualVolume = Math.max(minDb, Math.min(maxDb, status.actualVolume ?? minDb));

	const isUpper = direction === 'up';

	// Both keys share the split value so the knob crosses their boundary continuously.
	const segmentMin = isUpper ? splitDb : minDb;
	const segmentMax = isUpper ? maxDb : splitDb;

	const knobVisible = isUpper ? actualVolume >= splitDb : actualVolume <= splitDb;

	if (!knobVisible) {
		return undefined;
	}

	const percent = (actualVolume - segmentMin) / (segmentMax - segmentMin);

	return faderBottom - percent * faderHeight;
}

/** Creates the SVG data URL for one half of the two-key volume fader. */
export function createVolumeImage(status: ZoneStatus, direction: VolumeDirection): string {
	const faderTop = 18;
	const faderBottom = 126;
	const faderHeight = faderBottom - faderTop;

	const knobY = getVolumeKnobY(status, direction, {
		faderTop,
		faderBottom
	});

	const knob = knobY === undefined ? '' : `<rect x="56" y="${knobY - 6}" width="32" height="12" rx="4" fill="#d0d0d0"/>`;

	const svg = `
		<svg width="144" height="144" viewBox="0 0 144 144" xmlns="http://www.w3.org/2000/svg">
			<rect width="144" height="144" rx="20" fill="#202020"/>

			<rect x="65" y="${faderTop}" width="14" height="${faderHeight}" rx="7" fill="#3a3a3a"/>
			<rect x="70" y="${faderTop + 8}" width="4" height="${faderHeight - 16}" rx="2" fill="#8a8a8a"/>

			${knob}
		</svg>
	`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
