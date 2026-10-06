// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pluginRoot = resolve(process.cwd(), 'apps/streamdeck/yamaha-tsr700/de.frankpeterandrae.yamaha.sdPlugin');
const manifest = JSON.parse(readFileSync(resolve(pluginRoot, 'manifest.json'), 'utf8')) as {
	Actions: Array<{ UUID: string; PropertyInspectorPath?: string }>;
};

describe('Property inspector templates', () => {
	it.each([
		['input', 'getInputZones', 'input', 'getInputs'],
		['mute', 'getMuteZones', undefined, undefined],
		['power-on', 'getPowerZones', undefined, undefined],
		['scene', 'getSceneZones', 'scene', 'getScenes'],
		['volume', 'getVolumeZones', undefined, undefined],
		['net-usb-media-control', undefined, undefined, undefined]
	])('binds %s to global receiver settings and the action data sources', (name, zoneSource, optionSetting, optionSource) => {
		const action = manifest.Actions.find((item) => item.UUID === `de.frankpeterandrae.yamaha.${name}`);
		expect(action?.PropertyInspectorPath).toBe(`ui/${name}.html`);
		if (!action?.PropertyInspectorPath) throw new Error(`Missing inspector for ${name}`);
		const html = readFileSync(resolve(pluginRoot, action.PropertyInspectorPath), 'utf8');
		const page = new DOMParser().parseFromString(html, 'text/html');
		expect(page.documentElement.lang).toBe('en');
		expect(page.querySelector('sdpi-textfield[setting="receiverAddress"]')?.hasAttribute('global')).toBe(true);
		if (zoneSource) {
			const zone = page.querySelector('sdpi-select[setting="zone"]');
			expect(zone?.getAttribute('datasource')).toBe(zoneSource);
			expect(zone?.getAttribute('default')).toBe('main');
		}
		if (optionSetting) {
			expect(page.querySelector(`sdpi-select[setting="${optionSetting}"]`)?.getAttribute('datasource')).toBe(optionSource);
		}
		if (name === 'volume' || name === 'net-usb-media-control') {
			const setting = name === 'volume' ? 'direction' : 'command';
			const select = page.querySelector(`sdpi-select[setting="${setting}"]`);
			const values = [...(select?.querySelectorAll('option') ?? [])].map((option) => option.value);
			expect(values).toEqual(
				name === 'volume'
					? ['up', 'down']
					: ['play_pause', 'play', 'pause', 'stop', 'previous', 'next', 'fast_reverse', 'fast_forward']
			);
			expect(values).toContain(select?.getAttribute('default'));
		}
	});
});
