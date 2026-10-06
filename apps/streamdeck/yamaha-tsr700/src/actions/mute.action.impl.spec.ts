import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	statusService: {
		onStatusChanged: vi.fn(),
		getStatus: vi.fn(),
		refresh: vi.fn()
	},
	featuresService: {
		getMuteZones: vi.fn(),
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
		mute: vi.fn()
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

import { MuteActionImpl as MuteAction } from './mute.action.impl';

describe('MuteAction', () => {
	let action: MuteAction;

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.yamaha.mute.mockResolvedValue(undefined);
		mocks.statusService.refresh.mockResolvedValue(undefined);

		action = new MuteAction();
	});

	it('subscribes to status changes on construction', () => {
		expect(mocks.statusService.onStatusChanged).toHaveBeenCalledTimes(1);
		expect(typeof mocks.statusService.onStatusChanged.mock.calls[0]?.[0]).toBe('function');
	});

	it('updates matching actions when status changes', async () => {
		const matchingAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({ zone: 'main' }),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		const otherZoneAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({ zone: 'zone2' }),
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
		managedAction.actions = [nonKeyAction, otherZoneAction, matchingAction];

		const callback = mocks.statusService.onStatusChanged.mock.calls[0]?.[0] as (
			zone: string,
			status: { power: 'On' | 'Standby'; mute: boolean }
		) => void;

		callback('main', {
			power: 'On',
			mute: true
		});

		await vi.waitFor(() => {
			expect(matchingAction.setTitle).toHaveBeenCalledWith('Main Zone');
		});

		expect(matchingAction.setImage).toHaveBeenCalledWith('imgs/actions/mute/mute');
		expect(otherZoneAction.setTitle).not.toHaveBeenCalled();
		expect(otherZoneAction.setImage).not.toHaveBeenCalled();
		expect(nonKeyAction.getSettings).not.toHaveBeenCalled();
	});

	it('updates key title and image on appear when muted', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: true
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({ zone: 'main' }),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/mute/mute');
	});

	it('updates key title and image on appear when not muted', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: false
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({ zone: 'zone2' }),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('zone2');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Zone 2');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/mute/unmute');
	});

	it('uses main zone as default on appear', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: false
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/mute/unmute');
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

	it('ignores appear events when no status is known', async () => {
		mocks.statusService.getStatus.mockReturnValue(undefined);

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({ zone: 'main' }),
			setTitle: vi.fn(),
			setImage: vi.fn()
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('mutes when current state is not muted', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: false
		});

		await action.onKeyDown({
			action: {
				getSettings: vi.fn().mockResolvedValue({ zone: 'main' })
			}
		} as never);

		expect(mocks.yamaha.mute).toHaveBeenCalledWith('main', true);
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('unmutes when current state is muted', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: true
		});

		await action.onKeyDown({
			action: {
				getSettings: vi.fn().mockResolvedValue({ zone: 'zone2' })
			}
		} as never);

		expect(mocks.yamaha.mute).toHaveBeenCalledWith('zone2', false);
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('uses main zone as default on key down', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: false
		});

		await action.onKeyDown({
			action: {
				getSettings: vi.fn().mockResolvedValue({})
			}
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(mocks.yamaha.mute).toHaveBeenCalledWith('main', true);
		expect(mocks.statusService.refresh).toHaveBeenCalledOnce();
	});

	it('ignores key presses when no status is known', async () => {
		mocks.statusService.getStatus.mockReturnValue(undefined);

		const getSettings = vi.fn().mockResolvedValue({ zone: 'main' });

		await action.onKeyDown({
			action: {
				getSettings
			}
		} as never);

		expect(getSettings).toHaveBeenCalledTimes(1);
		expect(mocks.yamaha.mute).not.toHaveBeenCalled();
		expect(mocks.statusService.refresh).not.toHaveBeenCalled();
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
				settings: { zone: 'zone2' }
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
				settings: { zone: 'zone2' }
			}
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it('updates action on settings change', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: true
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: { zone: 'zone2' }
			}
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('zone2');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Zone 2');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/mute/mute');
	});

	it('falls back to main zone on settings event', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			mute: false
		});

		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: {}
			}
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/mute/unmute');
	});

	it('ignores non-getMuteZones events in onSendToPlugin', async () => {
		await action.onSendToPlugin({
			payload: { event: 'someOtherEvent' }
		} as never);

		expect(mocks.featuresService.getMuteZones).not.toHaveBeenCalled();
		expect(streamDeckMocks.ui.sendToPropertyInspector).not.toHaveBeenCalled();
	});

	it('sends mute zones to property inspector on getMuteZones request', async () => {
		mocks.featuresService.getMuteZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		await action.onSendToPlugin({
			payload: { event: 'getMuteZones' }
		} as never);

		expect(mocks.featuresService.getMuteZones).toHaveBeenCalledOnce();
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getMuteZones',
			items: [
				{ label: 'Main Zone', value: 'main' },
				{ label: 'Zone 2', value: 'zone2' }
			]
		});
	});
});
