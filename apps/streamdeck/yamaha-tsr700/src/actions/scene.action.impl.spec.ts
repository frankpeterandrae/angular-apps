import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	featuresService: {
		getSceneZones: vi.fn(),
		getScenes: vi.fn(),
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
	statusService: {
		refresh: vi.fn()
	},
	yamaha: {
		recallScene: vi.fn()
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
	featuresService: mocks.featuresService,
	statusService: mocks.statusService,
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

import { SceneActionImpl } from './scene.action.impl';

describe('SceneActionImpl', () => {
	let action: SceneActionImpl;

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.featuresService.getSceneZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		mocks.featuresService.getScenes.mockResolvedValue([
			{ id: 1, label: 'Scene 1' },
			{ id: 2, label: 'TV' },
			{ id: 3, label: 'Music' },
			{ id: 4, label: 'Scene 4' }
		]);

		mocks.yamaha.recallScene.mockResolvedValue(undefined);
		mocks.statusService.refresh.mockResolvedValue(undefined);

		action = new SceneActionImpl();
	});

	it('sets title and image on appear when scene is configured', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				scene: 2
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.featuresService.getScenes).not.toHaveBeenCalled();
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/scene/circle-number-2');
	});

	it('uses main zone as default on appear', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				scene: 3
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.featuresService.getScenes).not.toHaveBeenCalled();
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/scene/circle-number-3');
	});

	it('shows placeholder when no scene is selected', async () => {
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

		expect(mocks.featuresService.getScenes).not.toHaveBeenCalled();
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/scene/key');
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
		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('recalls configured scene on key down', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				scene: 2
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.recallScene).toHaveBeenCalledWith('main', 2);
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('recalls configured scene from string setting', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2',
				scene: '4'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.recallScene).toHaveBeenCalledWith('zone2', 4);
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('uses main zone as default on key down', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				scene: 1
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.recallScene).toHaveBeenCalledWith('main', 1);
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('does nothing when no scene is configured', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.recallScene).not.toHaveBeenCalled();
		expect(mocks.statusService.refresh).not.toHaveBeenCalled();
	});

	it('does nothing when scene setting is invalid', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				scene: 'invalid'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.recallScene).not.toHaveBeenCalled();
		expect(mocks.statusService.refresh).not.toHaveBeenCalled();
	});

	it('updates action on settings change using payload settings', async () => {
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
					scene: 4
				}
			}
		} as never);

		expect(keyAction.getSettings).not.toHaveBeenCalled();
		expect(mocks.featuresService.getScenes).not.toHaveBeenCalled();
		expect(keyAction.setTitle).toHaveBeenCalledWith('Zone 2');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/scene/circle-number-4');
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
					scene: 1
				}
			}
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('uses numbered scene image when scene is not in feature list', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				scene: 9
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.featuresService.getScenes).not.toHaveBeenCalled();
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/scene/circle-number-9');
	});

	it('sends scene zones to property inspector', async () => {
		await action.onSendToPlugin({
			payload: {
				event: 'getSceneZones'
			}
		} as never);

		expect(mocks.featuresService.getSceneZones).toHaveBeenCalledOnce();
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getSceneZones',
			items: [
				{ label: 'Main Zone', value: 'main' },
				{ label: 'Zone 2', value: 'zone2' }
			]
		});
	});

	it('sends scenes for current zone to property inspector', async () => {
		mocks.featuresService.getScenes.mockResolvedValueOnce([
			{ id: 1, label: 'Scene 1' },
			{ id: 2, label: 'Scene 2' }
		]);

		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2'
			})
		};

		await action.onSendToPlugin({
			action: keyAction,
			payload: {
				event: 'getScenes'
			}
		} as never);

		expect(keyAction.getSettings).toHaveBeenCalledOnce();
		expect(mocks.featuresService.getScenes).toHaveBeenCalledWith('zone2');
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getScenes',
			items: [
				{ label: 'Scene 1', value: 1 },
				{ label: 'Scene 2', value: 2 }
			]
		});
	});

	it('uses main zone for getScenes when no zone is configured', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({})
		};

		await action.onSendToPlugin({
			action: keyAction,
			payload: {
				event: 'getScenes'
			}
		} as never);

		expect(mocks.featuresService.getScenes).toHaveBeenCalledWith('main');
	});

	it('ignores unknown property inspector events', async () => {
		await action.onSendToPlugin({
			payload: {
				event: 'unknown'
			}
		} as never);

		expect(mocks.featuresService.getSceneZones).not.toHaveBeenCalled();
		expect(mocks.featuresService.getScenes).not.toHaveBeenCalled();
		expect(streamDeckMocks.ui.sendToPropertyInspector).not.toHaveBeenCalled();
	});
});
