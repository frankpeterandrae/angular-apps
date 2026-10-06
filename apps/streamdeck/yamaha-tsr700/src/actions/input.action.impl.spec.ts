import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	statusService: {
		onStatusChanged: vi.fn(),
		getStatus: vi.fn()
	},
	featuresService: {
		getInputZones: vi.fn(),
		getInputs: vi.fn(),
		getZoneLabel: vi.fn((zone: string) => {
			switch (zone) {
				case 'main':
					return 'Main Zone';
				case 'zone2':
					return 'Zone 2';
				case 'zone3':
					return 'Zone 3';
				case 'zone4':
					return 'Zone 4';
				default:
					return zone;
			}
		})
	},
	yamaha: {
		setInput: vi.fn()
	}
}));

const streamDeckMocks = vi.hoisted(() => ({
	ui: {
		sendToPropertyInspector: vi.fn().mockResolvedValue(undefined)
	},
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

vi.mock('../services', () => ({
	statusService: mocks.statusService,
	featuresService: mocks.featuresService,
	yamaha: mocks.yamaha
}));

vi.mock('@elgato/streamdeck', () => ({
	default: {
		ui: streamDeckMocks.ui,
		logger: streamDeckMocks.logger
	},
	action: () => (target: unknown) => target,
	SingletonAction: class {
		public actions: unknown[] = [];
	}
}));

import { InputActionImpl as InputAction } from './input.action.impl';

describe('InputAction', () => {
	let action: InputAction;

	type StatusChangedCallback = (
		zone: string,
		status: {
			power: 'On' | 'Standby';
			input?: string;
			inputText?: string;
		}
	) => void;

	function getStatusChangedCallback(): StatusChangedCallback {
		const callback = mocks.statusService.onStatusChanged.mock.calls.at(-1)?.[0];

		expect(callback).toEqual(expect.any(Function));

		return callback as StatusChangedCallback;
	}

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.featuresService.getInputs.mockResolvedValue([
			{ id: 'spotify', label: 'Spotify' },
			{ id: 'hdmi1', label: 'Blu-ray' },
			{ id: 'net_radio', label: 'Net Radio' },
			{ id: 'amazon_music', label: 'Amazon Music' }
		]);

		mocks.featuresService.getInputZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		mocks.yamaha.setInput.mockResolvedValue(undefined);

		action = new InputAction();
	});

	it('subscribes to status changes on construction', () => {
		expect(mocks.statusService.onStatusChanged).toHaveBeenCalledTimes(1);
		expect(typeof mocks.statusService.onStatusChanged.mock.calls[0]?.[0]).toBe('function');
	});

	it('updates title and active image on appear when configured input is active', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'spotify',
			inputText: 'Spotify'
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input: 'spotify'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(mocks.featuresService.getInputs).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nSpotify');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/spotify-active');
	});

	it('updates title and inactive image on appear when configured input is not active', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'net_radio',
			inputText: 'Net Radio'
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input: 'spotify'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nSpotify');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/spotify');
	});

	it('uses main zone as default on appear', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'hdmi1',
			inputText: 'Blu-ray'
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				input: 'hdmi1'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nBlu-ray');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/hdmi-active');
	});

	it('shows placeholder title when no input is selected', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'spotify',
			inputText: 'Spotify'
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nNo input selected');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/icon');
	});

	it('ignores non-key actions on appear', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(false),
			getSettings: vi.fn(),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.getSettings).not.toHaveBeenCalled();
		expect(mocks.statusService.getStatus).not.toHaveBeenCalled();
	});

	it('does not update on appear when no status is known', async () => {
		mocks.statusService.getStatus.mockReturnValue(undefined);

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input: 'spotify'
			}),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('sets configured input on key down', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2',
				input: 'amazon_music'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setInput).toHaveBeenCalledWith('zone2', 'amazon_music');
	});

	it('uses main zone as default on key down', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				input: 'spotify'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setInput).toHaveBeenCalledWith('main', 'spotify');
	});

	it('does not set input when no input is configured', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setInput).not.toHaveBeenCalled();
	});

	it('updates action on settings change using payload settings', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'hdmi1',
			inputText: 'Blu-ray'
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn(),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: {
					zone: 'zone2',
					input: 'hdmi1'
				}
			}
		} as never);

		expect(keyAction.getSettings).not.toHaveBeenCalled();
		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('zone2');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Zone 2\nBlu-ray');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/hdmi-active');
	});

	it('ignores settings changes for non-key actions', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(false),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: {
					zone: 'main',
					input: 'spotify'
				}
			}
		} as never);

		expect(mocks.statusService.getStatus).not.toHaveBeenCalled();
		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('ignores settings changes when no status is known', async () => {
		mocks.statusService.getStatus.mockReturnValue(undefined);

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: {
					zone: 'main',
					input: 'spotify'
				}
			}
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('updates visible matching actions when status changes', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'net_radio',
			inputText: 'Net Radio'
		});

		const callback = getStatusChangedCallback();

		const mainSpotifyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input: 'spotify'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		const mainNetRadioAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input: 'net_radio'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		const zone2SpotifyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2',
				input: 'spotify'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		const nonKeyAction = {
			isKey: vi.fn().mockReturnValue(false),
			getSettings: vi.fn(),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		const managedAction = action as unknown as { actions: unknown[] };
		managedAction.actions = [nonKeyAction, zone2SpotifyAction, mainSpotifyAction, mainNetRadioAction];

		callback('main', {
			power: 'On',
			input: 'spotify',
			inputText: 'Spotify'
		});

		await vi.waitFor(() => {
			expect(mainSpotifyAction.setTitle).toHaveBeenCalledWith('Main Zone\nSpotify');
		});

		expect(mainSpotifyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/spotify-active');

		expect(mainNetRadioAction.setTitle).toHaveBeenCalledWith('Main Zone\nNet Radio');
		expect(mainNetRadioAction.setImage).toHaveBeenCalledWith('imgs/actions/input/net-radio');

		expect(zone2SpotifyAction.setTitle).not.toHaveBeenCalled();
		expect(zone2SpotifyAction.setImage).not.toHaveBeenCalled();

		expect(nonKeyAction.getSettings).not.toHaveBeenCalled();
	});

	it('sends input zones to property inspector', async () => {
		await action.onSendToPlugin({
			payload: {
				event: 'getInputZones'
			}
		} as never);

		expect(mocks.featuresService.getInputZones).toHaveBeenCalledOnce();
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getInputZones',
			items: [
				{ label: 'Main Zone', value: 'main' },
				{ label: 'Zone 2', value: 'zone2' }
			]
		});
	});

	it('sends inputs for current zone to property inspector', async () => {
		mocks.featuresService.getInputs.mockResolvedValueOnce([
			{ id: 'audio1', label: 'Audio 1' },
			{ id: 'phono', label: 'Phono' }
		]);

		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2'
			})
		};

		await action.onSendToPlugin({
			action: keyAction,
			payload: {
				event: 'getInputs'
			}
		} as never);

		expect(keyAction.getSettings).toHaveBeenCalledOnce();
		expect(mocks.featuresService.getInputs).toHaveBeenCalledWith('zone2');
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getInputs',
			items: [
				{ label: 'Audio 1', value: 'audio1' },
				{ label: 'Phono', value: 'phono' }
			]
		});
	});

	it('uses main zone for getInputs when no zone is configured', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({})
		};

		await action.onSendToPlugin({
			action: keyAction,
			payload: {
				event: 'getInputs'
			}
		} as never);

		expect(mocks.featuresService.getInputs).toHaveBeenCalledWith('main');
	});

	it('ignores unknown property inspector events', async () => {
		await action.onSendToPlugin({
			payload: {
				event: 'someOtherEvent'
			}
		} as never);

		expect(mocks.featuresService.getInputZones).not.toHaveBeenCalled();
		expect(mocks.featuresService.getInputs).not.toHaveBeenCalled();
		expect(streamDeckMocks.ui.sendToPropertyInspector).not.toHaveBeenCalled();
	});

	it.each([
		['airplay', 'imgs/actions/input/airplay-active'],
		['amazon_music', 'imgs/actions/input/amazon-music-active'],

		['audio1', 'imgs/actions/input/audio-active'],
		['audio2', 'imgs/actions/input/audio-active'],
		['audio3', 'imgs/actions/input/audio-active'],
		['audio4', 'imgs/actions/input/audio-active'],
		['audio5', 'imgs/actions/input/audio-active'],

		['bluetooth', 'imgs/actions/input/bluetooth-active'],
		['deezer', 'imgs/actions/input/deezer-active'],

		['hdmi1', 'imgs/actions/input/hdmi-active'],
		['hdmi2', 'imgs/actions/input/hdmi-active'],
		['hdmi3', 'imgs/actions/input/hdmi-active'],
		['hdmi4', 'imgs/actions/input/hdmi-active'],
		['hdmi5', 'imgs/actions/input/hdmi-active'],
		['hdmi6', 'imgs/actions/input/hdmi-active'],
		['hdmi7', 'imgs/actions/input/hdmi-active'],

		['main_sync', 'imgs/actions/input/audio-active'],
		['mc_link', 'imgs/actions/input/audio-active'],

		['napster', 'imgs/actions/input/napster-active'],
		['net_radio', 'imgs/actions/input/net-radio-active'],
		['phono', 'imgs/actions/input/phono-active'],
		['qobuz', 'imgs/actions/input/qobuz-active'],
		['server', 'imgs/actions/input/server-active'],
		['spotify', 'imgs/actions/input/spotify-active'],
		['tidal', 'imgs/actions/input/tidal-active'],
		['tuner', 'imgs/actions/input/tuner-active'],
		['tv', 'imgs/actions/input/tv-active'],
		['usb', 'imgs/actions/input/usb-active'],

		['unknown_input', 'imgs/actions/input/audio-active']
	])('sets expected active image for input %s', async (input, expectedImage) => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input,
			inputText: input
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setImage).toHaveBeenCalledWith(expectedImage);
	});

	it('falls back to input id when no input label is found', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			input: 'spotify',
			inputText: 'Spotify'
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				input: 'unknown_input'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.featuresService.getInputs).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nunknown_input');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/input/audio');
	});
});
