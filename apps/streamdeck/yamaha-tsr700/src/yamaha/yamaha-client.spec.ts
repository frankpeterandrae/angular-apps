import { beforeEach, describe, expect, it, vi } from 'vitest';

import { YamahaExtendedControlClient } from './http';
import type { NetUsbPlayInfo, YamahaExtendedFeatures, YamahaNameTexts } from './models';
import { YamahaClient } from './yamaha-client';

describe('YamahaClient', () => {
	let extendedControlClient: YamahaExtendedControlClient;
	let client: YamahaClient;

	const features: YamahaExtendedFeatures = {
		system: {
			func_list: [],
			zone_num: 2,
			input_list: []
		},
		zone: [
			{
				id: 'main',
				func_list: ['power', 'volume', 'mute'],
				input_list: ['hdmi1', 'spotify']
			},
			{
				id: 'zone2',
				func_list: ['power', 'volume'],
				input_list: ['audio1']
			}
		]
	};

	const nameTexts: YamahaNameTexts = {
		zone_list: [
			{ id: 'main', text: 'Wohnzimmer' },
			{ id: 'zone2', text: 'Küche' }
		],
		input_list: [
			{ id: 'hdmi1', text: 'Blu-ray' },
			{ id: 'spotify', text: 'Spotify' }
		],
		sound_program_list: [{ id: 'straight', text: 'Straight' }]
	};

	const playInfo: NetUsbPlayInfo = {
		input: 'amazon_music',
		playback: 'play',
		repeat: 'off',
		shuffle: 'on',
		playTime: 8,
		totalTime: 92,
		artist: 'Kato',
		album: 'Cel-Shaded Memories',
		track: 'Papermoon',
		albumArtUrl: 'http://192.168.178.67/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
		albumArtId: 4408
	};

	beforeEach(() => {
		extendedControlClient = {
			powerOn: vi.fn().mockResolvedValue(undefined),
			standby: vi.fn().mockResolvedValue(undefined),
			setInput: vi.fn().mockResolvedValue(undefined),
			mute: vi.fn().mockResolvedValue(undefined),
			changeVolume: vi.fn().mockResolvedValue(undefined),
			getBasicStatus: vi.fn().mockResolvedValue({
				power: 'On'
			}),
			getFeatures: vi.fn().mockResolvedValue(features),
			getNameTexts: vi.fn().mockResolvedValue(nameTexts),
			recallScene: vi.fn().mockResolvedValue(undefined),
			setNetUsbPlayback: vi.fn().mockResolvedValue(undefined),
			getNetUsbPlayInfo: vi.fn().mockResolvedValue(playInfo)
		} as unknown as YamahaExtendedControlClient;

		client = new YamahaClient(extendedControlClient);
	});

	it('powers on the receiver', async () => {
		await client.powerOn('main');

		expect(extendedControlClient.powerOn).toHaveBeenCalledWith('main');
	});

	it('switches to standby', async () => {
		await client.standby('zone2');

		expect(extendedControlClient.standby).toHaveBeenCalledWith('zone2');
	});

	it('changes the input', async () => {
		await client.setInput('main', 'hdmi1');

		expect(extendedControlClient.setInput).toHaveBeenCalledWith('main', 'hdmi1');
	});

	it('changes the input for zone 2', async () => {
		await client.setInput('zone2', 'audio1');

		expect(extendedControlClient.setInput).toHaveBeenCalledWith('zone2', 'audio1');
	});

	it('enables mute', async () => {
		await client.mute('main', true);

		expect(extendedControlClient.mute).toHaveBeenCalledWith('main', true);
	});

	it('disables mute for zone 2', async () => {
		await client.mute('zone2', false);

		expect(extendedControlClient.mute).toHaveBeenCalledWith('zone2', false);
	});

	it('requests the basic status', async () => {
		await expect(client.getBasicStatus('main')).resolves.toEqual({
			power: 'On'
		});

		expect(extendedControlClient.getBasicStatus).toHaveBeenCalledWith('main');
	});

	it('gets features', async () => {
		await expect(client.getFeatures()).resolves.toBe(features);

		expect(extendedControlClient.getFeatures).toHaveBeenCalledOnce();
	});

	it('gets name texts', async () => {
		await expect(client.getNameTexts()).resolves.toBe(nameTexts);

		expect(extendedControlClient.getNameTexts).toHaveBeenCalledOnce();
	});

	it('changes volume', async () => {
		await client.changeVolume('main', 'up');

		expect(extendedControlClient.changeVolume).toHaveBeenCalledWith('main', 'up');
	});

	it('changes volume down for zone 2', async () => {
		await client.changeVolume('zone2', 'down');

		expect(extendedControlClient.changeVolume).toHaveBeenCalledWith('zone2', 'down');
	});

	it('recalls a scene', async () => {
		await client.recallScene('main', 2);

		expect(extendedControlClient.recallScene).toHaveBeenCalledWith('main', 2);
	});

	it('recalls a scene for zone 2', async () => {
		await client.recallScene('zone2', 4);

		expect(extendedControlClient.recallScene).toHaveBeenCalledWith('zone2', 4);
	});

	it('sets NetUSB playback', async () => {
		await client.setNetUsbPlayback('play_pause');

		expect(extendedControlClient.setNetUsbPlayback).toHaveBeenCalledWith('play_pause');
	});

	it('sets NetUSB playback to next', async () => {
		await client.setNetUsbPlayback('next');

		expect(extendedControlClient.setNetUsbPlayback).toHaveBeenCalledWith('next');
	});

	it('gets NetUSB play info', async () => {
		await expect(client.getNetUsbPlayInfo()).resolves.toBe(playInfo);

		expect(extendedControlClient.getNetUsbPlayInfo).toHaveBeenCalledOnce();
	});
});
