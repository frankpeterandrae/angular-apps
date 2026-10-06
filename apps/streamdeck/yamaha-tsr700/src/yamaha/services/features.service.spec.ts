import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamDeckMocks = vi.hoisted(() => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

vi.mock('@elgato/streamdeck', () => ({
	default: {
		logger: streamDeckMocks.logger
	}
}));

import type { YamahaExtendedFeatures, YamahaNameTexts } from '../models';
import type { YamahaClient } from '../yamaha-client';

import { FeaturesService } from './features.service';

describe('FeaturesService', () => {
	let yamaha: Pick<YamahaClient, 'getFeatures' | 'getNameTexts'>;
	let service: FeaturesService;

	const firstFeatures: YamahaExtendedFeatures = {
		system: {
			func_list: [],
			zone_num: 2,
			input_list: [
				{
					id: 'hdmi1',
					distribution_enable: false,
					rename_enable: true,
					account_enable: false,
					play_info_type: 'none'
				},
				{
					id: 'spotify',
					distribution_enable: true,
					rename_enable: false,
					account_enable: false,
					play_info_type: 'spotify'
				}
			]
		},
		zone: [
			{
				id: 'main',
				func_list: ['power', 'volume', 'mute', 'scene', 'sound_program'],
				input_list: ['hdmi1', 'missing_input', 'spotify'],
				sound_program_list: ['straight', 'movie'],
				scene_num: 4
			},
			{
				id: 'zone2',
				func_list: ['power', 'volume'],
				input_list: ['hdmi1']
			},
			{
				id: 'zone3',
				func_list: [],
				input_list: []
			},
			{
				id: 'zone4',
				func_list: [],
				input_list: []
			}
		]
	};

	const firstNameTexts: YamahaNameTexts = {
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

	const refreshedFeatures: YamahaExtendedFeatures = {
		system: {
			func_list: ['network_standby'],
			zone_num: 1,
			input_list: [{ id: 'tv' }]
		},
		zone: [{ id: 'main', func_list: ['power'], input_list: ['tv'] }]
	};

	const refreshedNameTexts: YamahaNameTexts = {
		zone_list: [{ id: 'main', text: 'Main Zone' }],
		input_list: [{ id: 'tv', text: 'TV' }],
		sound_program_list: []
	};

	beforeEach(() => {
		vi.clearAllMocks();

		yamaha = {
			getFeatures: vi.fn(),
			getNameTexts: vi.fn()
		} satisfies Pick<YamahaClient, 'getFeatures' | 'getNameTexts'>;

		vi.mocked(yamaha.getNameTexts).mockResolvedValue(firstNameTexts);

		service = new FeaturesService(yamaha);
	});

	it('discards features from a request started before cache invalidation', async () => {
		let finish!: (features: YamahaExtendedFeatures) => void;
		vi.mocked(yamaha.getFeatures)
			.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						finish = resolve;
					})
			)
			.mockResolvedValue(refreshedFeatures);
		const request = service.getFeatures();
		service.clearCache();
		finish(firstFeatures);
		expect(await request).toBe(refreshedFeatures);
		expect(await service.getFeatures()).toBe(refreshedFeatures);
	});

	it('discards name texts from a request started before cache invalidation', async () => {
		let finish!: (texts: YamahaNameTexts) => void;
		vi.mocked(yamaha.getNameTexts)
			.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						finish = resolve;
					})
			)
			.mockResolvedValue(refreshedNameTexts);
		const request = service.getNameTexts();
		service.clearCache();
		finish(firstNameTexts);
		expect(await request).toBe(refreshedNameTexts);
	});

	it('caches features after first load', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		const first = await service.getFeatures();
		const second = await service.getFeatures();

		expect(yamaha.getFeatures).toHaveBeenCalledOnce();
		expect(first).toBe(firstFeatures);
		expect(second).toBe(firstFeatures);
	});

	it('clearCache causes the next getFeatures call to fetch again', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValueOnce(firstFeatures).mockResolvedValueOnce(refreshedFeatures);

		await service.getFeatures();
		service.clearCache();

		const updated = await service.getFeatures();

		expect(yamaha.getFeatures).toHaveBeenCalledTimes(2);
		expect(updated).toBe(refreshedFeatures);
	});

	it('clearCache causes the next getNameTexts call to fetch again', async () => {
		vi.mocked(yamaha.getNameTexts).mockResolvedValueOnce(firstNameTexts).mockResolvedValueOnce(refreshedNameTexts);

		const first = await service.getNameTexts();

		service.clearCache();

		const updated = await service.getNameTexts();

		expect(yamaha.getNameTexts).toHaveBeenCalledTimes(2);
		expect(first).toBe(firstNameTexts);
		expect(updated).toBe(refreshedNameTexts);
	});

	it('refresh clears cache and returns freshly fetched features', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValueOnce(firstFeatures).mockResolvedValueOnce(refreshedFeatures);

		await service.getFeatures();

		const refreshed = await service.refresh();

		expect(yamaha.getFeatures).toHaveBeenCalledTimes(2);
		expect(refreshed).toBe(refreshedFeatures);
	});

	it('returns all available zones with labels', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getZones()).resolves.toEqual([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' },
			{ id: 'zone3', label: 'Zone 3' },
			{ id: 'zone4', label: 'Zone 4' }
		]);
	});

	it('returns only zones that support power', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getPowerZones()).resolves.toEqual([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);
	});

	it('returns only zones that support volume', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getVolumeZones()).resolves.toEqual([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);
	});

	it('returns only zones that support mute', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getMuteZones()).resolves.toEqual([{ id: 'main', label: 'Main Zone' }]);
	});

	it('returns only zones that have inputs', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getInputZones()).resolves.toEqual([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);
	});

	it('returns zone inputs in configured order with Yamaha name texts', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);
		vi.mocked(yamaha.getNameTexts).mockResolvedValue(firstNameTexts);

		await expect(service.getInputs('main')).resolves.toEqual([
			{ id: 'hdmi1', label: 'Blu-ray' },
			{ id: 'missing_input', label: 'Missing Input' },
			{ id: 'spotify', label: 'Spotify' }
		]);
	});

	it('caches name texts when inputs are requested repeatedly', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);
		vi.mocked(yamaha.getNameTexts).mockResolvedValue(firstNameTexts);

		const first = await service.getInputs('main');
		const second = await service.getInputs('zone2');

		expect(yamaha.getFeatures).toHaveBeenCalledOnce();
		expect(yamaha.getNameTexts).toHaveBeenCalledOnce();

		expect(first).toEqual([
			{ id: 'hdmi1', label: 'Blu-ray' },
			{ id: 'missing_input', label: 'Missing Input' },
			{ id: 'spotify', label: 'Spotify' }
		]);

		expect(second).toEqual([{ id: 'hdmi1', label: 'Blu-ray' }]);
	});

	it('falls back to formatted input ids when name texts cannot be loaded', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);
		vi.mocked(yamaha.getNameTexts).mockRejectedValue(new Error('fetch failed'));

		await expect(service.getInputs('main')).resolves.toEqual([
			{ id: 'hdmi1', label: 'Hdmi1' },
			{ id: 'missing_input', label: 'Missing Input' },
			{ id: 'spotify', label: 'Spotify' }
		]);

		expect(streamDeckMocks.logger.warn).toHaveBeenCalledWith(
			'Could not load Yamaha name texts. Falling back to formatted input ids. fetch failed'
		);
	});

	it('returns empty input list for zones without inputs', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getInputs('zone3')).resolves.toEqual([]);
	});

	it('returns scenes when scene function is supported', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getScenes('main')).resolves.toEqual([
			{ id: 1, label: 'Scene 1' },
			{ id: 2, label: 'Scene 2' },
			{ id: 3, label: 'Scene 3' },
			{ id: 4, label: 'Scene 4' }
		]);
	});

	it('returns empty scenes when scene function is missing', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getScenes('zone2')).resolves.toEqual([]);
	});

	it('returns sound programs when supported', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getSoundPrograms('main')).resolves.toEqual([
			{ id: 'straight', label: 'Straight' },
			{ id: 'movie', label: 'Movie' }
		]);
	});

	it('returns empty sound programs when function is missing', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getSoundPrograms('zone2')).resolves.toEqual([]);
	});

	it('returns only zones that support scenes', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue(firstFeatures);

		await expect(service.getSceneZones()).resolves.toEqual([{ id: 'main', label: 'Main Zone' }]);
	});

	it('returns no scene zones when no zone supports scenes', async () => {
		vi.mocked(yamaha.getFeatures).mockResolvedValue({
			system: {
				func_list: [],
				zone_num: 2,
				input_list: []
			},
			zone: [
				{
					id: 'main',
					func_list: ['power'],
					input_list: ['hdmi1']
				},
				{
					id: 'zone2',
					func_list: ['power'],
					input_list: ['audio1']
				}
			]
		});

		await expect(service.getSceneZones()).resolves.toEqual([]);
	});
});
