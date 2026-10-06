import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SettingsService } from '../services';

import { YamahaExtendedControlClient } from './yamaha-extended-control-client';

describe('YamahaExtendedControlClient', () => {
	let client: YamahaExtendedControlClient;

	beforeEach(() => {
		const settings: Pick<SettingsService, 'getReceiverAddress'> = {
			getReceiverAddress: vi.fn().mockResolvedValue('192.168.178.67')
		};

		client = new YamahaExtendedControlClient(settings);

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue({
					response_code: 0
				})
			})
		);
	});

	it('powers on the main zone', async () => {
		await client.powerOn('main');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/setPower?power=on', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('switches zone 2 to standby', async () => {
		await client.standby('zone2');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/zone2/setPower?power=standby', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('changes the main input', async () => {
		await client.setInput('main', 'hdmi1');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/setInput?input=hdmi1', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('enables mute', async () => {
		await client.mute('main', true);

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/setMute?enable=true', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('disables mute', async () => {
		await client.mute('main', false);

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/setMute?enable=false', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('maps main zone status power on', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				power: 'on'
			})
		} as unknown as Response);

		await expect(client.getBasicStatus('main')).resolves.toEqual({
			power: 'On',
			mute: undefined,
			volume: undefined,
			maxVolume: undefined,
			actualVolume: undefined,
			input: undefined,
			inputText: undefined
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/getStatus', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('maps zone 2 status standby', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				power: 'standby'
			})
		} as unknown as Response);

		await expect(client.getBasicStatus('zone2')).resolves.toEqual({
			power: 'Standby',
			mute: undefined,
			volume: undefined,
			maxVolume: undefined,
			actualVolume: undefined,
			input: undefined,
			inputText: undefined
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/zone2/getStatus', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('maps volume information from zone status', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				power: 'on',
				volume: 90,
				max_volume: 161,
				actual_volume: {
					mode: 'db',
					value: -35,
					unit: 'dB'
				}
			})
		} as unknown as Response);

		await expect(client.getBasicStatus('main')).resolves.toEqual({
			power: 'On',
			volume: 90,
			maxVolume: 161,
			actualVolume: -35
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/getStatus', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('throws on non successful Yamaha response code', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 4
			})
		} as unknown as Response);

		await expect(client.powerOn('main')).rejects.toThrow('Yamaha Extended Control returned response_code=4.');
	});

	it('throws on failed HTTP response', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 500
		} as Response);

		await expect(client.powerOn('main')).rejects.toThrow('Yamaha Extended Control request failed with HTTP 500.');
	});

	it('gets features', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				system: {
					func_list: ['network_standby'],
					zone_num: 2,
					input_list: [
						{
							id: 'hdmi1',
							distribution_enable: false,
							rename_enable: true,
							account_enable: false,
							play_info_type: 'none'
						}
					]
				},
				zone: [
					{
						id: 'main',
						func_list: ['power', 'mute', 'volume'],
						input_list: ['hdmi1', 'spotify'],
						sound_program_list: ['straight']
					},
					{
						id: 'zone2',
						zone_b: false,
						func_list: ['power'],
						input_list: ['hdmi1']
					}
				]
			})
		} as unknown as Response);

		await expect(client.getFeatures()).resolves.toEqual({
			system: {
				func_list: ['network_standby'],
				zone_num: 2,
				input_list: [
					{
						id: 'hdmi1',
						distribution_enable: false,
						rename_enable: true,
						account_enable: false,
						play_info_type: 'none'
					}
				]
			},
			zone: [
				{
					id: 'main',
					func_list: ['power', 'mute', 'volume'],
					input_list: ['hdmi1', 'spotify'],
					sound_program_list: ['straight']
				},
				{
					id: 'zone2',
					zone_b: false,
					func_list: ['power'],
					input_list: ['hdmi1']
				}
			]
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/system/getFeatures', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('gets power zones from features', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				system: {
					func_list: ['network_standby'],
					zone_num: 4,
					input_list: []
				},
				zone: [
					{
						id: 'main',
						func_list: ['power', 'mute', 'volume'],
						input_list: ['hdmi1', 'spotify'],
						sound_program_list: ['straight']
					},
					{
						id: 'zone2',
						zone_b: false,
						func_list: ['power', 'mute'],
						input_list: ['hdmi1']
					},
					{
						id: 'zone3',
						func_list: ['volume'],
						input_list: ['hdmi1']
					},
					{
						id: 'zone4',
						func_list: ['power'],
						input_list: ['spotify']
					}
				]
			})
		} as unknown as Response);

		await expect(client.getPowerZones()).resolves.toEqual(['main', 'zone2', 'zone4']);

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/system/getFeatures', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('changes volume up for the main zone', async () => {
		await client.changeVolume('main', 'up');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/setVolume?volume=up', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('changes volume down for zone 2', async () => {
		await client.changeVolume('zone2', 'down');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/zone2/setVolume?volume=down', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('maps mute and input information from zone status', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				power: 'on',
				mute: true,
				input: 'amazon_music',
				input_text: 'Amazon Music'
			})
		} as unknown as Response);

		await expect(client.getBasicStatus('zone2')).resolves.toEqual({
			power: 'On',
			mute: true,
			volume: undefined,
			maxVolume: undefined,
			actualVolume: undefined,
			input: 'amazon_music',
			inputText: 'Amazon Music'
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/zone2/getStatus', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('changes zone 2 input', async () => {
		await client.setInput('zone2', 'audio1');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/zone2/setInput?input=audio1', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('gets name texts', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				zone_list: [
					{
						id: 'main',
						text: 'Wohnzimmer'
					},
					{
						id: 'zone2',
						text: 'Küche'
					}
				],
				input_list: [
					{
						id: 'hdmi1',
						text: 'Blu-ray'
					},
					{
						id: 'amazon_music',
						text: 'Amazon Music'
					}
				],
				sound_program_list: [
					{
						id: 'all_ch_stereo',
						text: 'All-Channel Stereo'
					}
				]
			})
		} as unknown as Response);

		await expect(client.getNameTexts()).resolves.toEqual({
			zone_list: [
				{
					id: 'main',
					text: 'Wohnzimmer'
				},
				{
					id: 'zone2',
					text: 'Küche'
				}
			],
			input_list: [
				{
					id: 'hdmi1',
					text: 'Blu-ray'
				},
				{
					id: 'amazon_music',
					text: 'Amazon Music'
				}
			],
			sound_program_list: [
				{
					id: 'all_ch_stereo',
					text: 'All-Channel Stereo'
				}
			]
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/system/getNameText', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('throws readable error when fetch fails', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new TypeError('fetch failed'));

		await expect(client.getNameTexts()).rejects.toThrow(
			'Yamaha Extended Control request failed for http://192.168.178.67/YamahaExtendedControl/v1/system/getNameText: fetch failed'
		);
	});

	it('recalls scene for the main zone', async () => {
		await client.recallScene('main', 1);

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/main/recallScene?num=1', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('recalls scene for zone 2', async () => {
		await client.recallScene('zone2', 4);

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/zone2/recallScene?num=4', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('sets NetUSB playback to play_pause', async () => {
		await client.setNetUsbPlayback('play_pause');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/netusb/setPlayback?playback=play_pause', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('sets NetUSB playback to next', async () => {
		await client.setNetUsbPlayback('next');

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/netusb/setPlayback?playback=next', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('gets NetUSB play info and resolves album art URL', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				input: 'amazon_music',
				playback: 'play',
				repeat: 'off',
				shuffle: 'on',
				play_time: 8,
				total_time: 92,
				artist: 'Kato',
				album: 'Cel-Shaded Memories',
				track: 'Papermoon',
				albumart_url: '/YamahaRemoteControl/AlbumART/AlbumART4408.jpg',
				albumart_id: 4408
			})
		} as unknown as Response);

		await expect(client.getNetUsbPlayInfo()).resolves.toEqual({
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
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/netusb/getPlayInfo', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('gets NetUSB play info without album art URL', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				input: 'net_radio',
				playback: 'stop',
				artist: '',
				album: '',
				track: '',
				albumart_url: '',
				albumart_id: 0
			})
		} as unknown as Response);

		await expect(client.getNetUsbPlayInfo()).resolves.toEqual({
			input: 'net_radio',
			playback: 'stop',
			repeat: undefined,
			shuffle: undefined,
			playTime: undefined,
			totalTime: undefined,
			artist: '',
			album: '',
			track: '',
			albumArtUrl: undefined,
			albumArtId: 0
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/netusb/getPlayInfo', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('gets NetUSB play info without album art when album art URL is blank', async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({
				response_code: 0,
				input: 'spotify',
				playback: 'pause',
				albumart_url: '   '
			})
		} as unknown as Response);

		await expect(client.getNetUsbPlayInfo()).resolves.toEqual({
			input: 'spotify',
			playback: 'pause',
			repeat: undefined,
			shuffle: undefined,
			playTime: undefined,
			totalTime: undefined,
			artist: undefined,
			album: undefined,
			track: undefined,
			albumArtUrl: undefined,
			albumArtId: undefined
		});

		expect(fetch).toHaveBeenCalledWith('http://192.168.178.67/YamahaExtendedControl/v1/netusb/getPlayInfo', {
			method: 'GET',
			signal: expect.any(AbortSignal)
		});
	});

	it('throws readable error when fetch fails with a non-error value', async () => {
		vi.mocked(fetch).mockRejectedValueOnce('network down');

		await expect(client.powerOn('main')).rejects.toThrow(
			'Yamaha Extended Control request failed for http://192.168.178.67/YamahaExtendedControl/v1/main/setPower?power=on: network down'
		);
	});
});
