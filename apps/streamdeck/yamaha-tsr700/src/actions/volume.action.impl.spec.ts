import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	statusService: {
		onStatusChanged: vi.fn(),
		getStatus: vi.fn()
	},
	featuresService: {
		getZones: vi.fn(),
		getVolumeZones: vi.fn()
	},
	yamaha: {
		changeVolume: vi.fn()
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
	SingletonAction: class {}
}));

import { VolumeActionImpl as VolumeAction } from './volume.action.impl';

describe('VolumeAction', () => {
	let action: VolumeAction;

	type StatusChangedCallback = (zone: string, status: { power: 'On' | 'Standby'; actualVolume: number }) => void;

	function getStatusChangedCallback(): StatusChangedCallback {
		const callback = mocks.statusService.onStatusChanged.mock.calls.at(-1)?.[0];

		expect(callback).toEqual(expect.any(Function));

		return callback as StatusChangedCallback;
	}

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.featuresService.getZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		mocks.yamaha.changeVolume.mockResolvedValue(undefined);

		action = new VolumeAction();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('does not start repeating when released during the initial request', async () => {
		vi.useFakeTimers();
		mocks.statusService.getStatus.mockReturnValue({ power: 'On', actualVolume: -40 });
		let finish!: () => void;
		mocks.yamaha.changeVolume.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				})
		);
		const key = { id: 'slow', getSettings: vi.fn().mockResolvedValue({}) };
		const down = action.onKeyDown({ action: key } as never);
		await vi.waitFor(() => expect(mocks.yamaha.changeVolume).toHaveBeenCalledOnce());
		action.onKeyUp({ action: key } as never);
		finish();
		await down;
		await vi.advanceTimersByTimeAsync(1000);
		expect(mocks.yamaha.changeVolume).toHaveBeenCalledOnce();
	});

	it('subscribes to status changes on construction', () => {
		expect(mocks.statusService.onStatusChanged).toHaveBeenCalledTimes(1);
		expect(typeof mocks.statusService.onStatusChanged.mock.calls[0]?.[0]).toBe('function');
	});

	it('updates title and image on appear when status is known', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const keyAction = {
			id: 'volume-up-main',
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('main');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone');
		expect(keyAction.setImage).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/svg\+xml;utf8,/));
	});

	it('uses main zone and volume up as defaults on appear', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const keyAction = {
			id: 'volume-default',
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
		expect(keyAction.setImage).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/svg\+xml;utf8,/));
	});

	it('ignores non-key actions on appear', async () => {
		const keyAction = {
			id: 'not-a-key',
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
			id: 'volume-up-main',
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
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

	it('updates visible matching actions when status changes', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const callback = getStatusChangedCallback();

		const mainAction = {
			id: 'volume-up-main',
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		const zone2Action = {
			id: 'volume-up-zone2',
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2',
				direction: 'up'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({ action: mainAction } as never);
		await action.onWillAppear({ action: zone2Action } as never);

		mainAction.setTitle.mockClear();
		mainAction.setImage.mockClear();
		zone2Action.setTitle.mockClear();
		zone2Action.setImage.mockClear();

		callback('main', {
			power: 'On',
			actualVolume: -20
		});

		await vi.waitFor(() => {
			expect(mainAction.setTitle).toHaveBeenCalledWith('Main Zone');
		});

		expect(mainAction.setImage).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/svg\+xml;utf8,/));
		expect(zone2Action.setTitle).not.toHaveBeenCalled();
		expect(zone2Action.setImage).not.toHaveBeenCalled();
	});

	it('updates action on settings change when status is known', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -60
		});

		const keyAction = {
			id: 'volume-down-zone2',
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'zone2',
				direction: 'down'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: {
					zone: 'zone2',
					direction: 'down'
				}
			}
		} as never);

		expect(mocks.statusService.getStatus).toHaveBeenCalledWith('zone2');
		expect(keyAction.setTitle).toHaveBeenCalledWith('Zone 2');
		expect(keyAction.setImage).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/svg\+xml;utf8,/));
	});

	it('changes volume once on key down', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const keyAction = {
			id: 'volume-up-main',
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledWith('main', 'up');
		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(1);
	});

	it('repeats volume change while key is held', async () => {
		vi.useFakeTimers();

		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const keyAction = {
			id: 'volume-up-main',
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(300);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(2);

		await vi.advanceTimersByTimeAsync(50);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(3);

		await vi.advanceTimersByTimeAsync(50);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(4);
	});

	it('stops repeating on key up', async () => {
		vi.useFakeTimers();

		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const keyAction = {
			id: 'volume-up-main',
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		await vi.advanceTimersByTimeAsync(300);

		action.onKeyUp({
			action: keyAction
		} as never);

		await vi.advanceTimersByTimeAsync(500);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(2);
	});

	it('does not change volume up when max volume is reached', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: 0
		});

		const keyAction = {
			id: 'volume-up-main',
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.changeVolume).not.toHaveBeenCalled();
	});

	it('does not change volume down when min volume is reached', async () => {
		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -80
		});

		const keyAction = {
			id: 'volume-down-main',
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'down'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.changeVolume).not.toHaveBeenCalled();
	});

	it('sends volume zones to property inspector', async () => {
		mocks.featuresService.getVolumeZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		await action.onSendToPlugin({
			payload: {
				event: 'getVolumeZones'
			}
		} as never);

		expect(mocks.featuresService.getVolumeZones).toHaveBeenCalledOnce();
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getVolumeZones',
			items: [
				{ label: 'Main Zone', value: 'main' },
				{ label: 'Zone 2', value: 'zone2' }
			]
		});
	});

	it('ignores other property inspector events', async () => {
		await action.onSendToPlugin({
			payload: {
				event: 'someOtherEvent'
			}
		} as never);

		expect(mocks.featuresService.getVolumeZones).not.toHaveBeenCalled();
		expect(streamDeckMocks.ui.sendToPropertyInspector).not.toHaveBeenCalled();
	});

	it('removes visible action and stops timer on disappear', async () => {
		vi.useFakeTimers();

		mocks.statusService.getStatus.mockReturnValue({
			power: 'On',
			actualVolume: -40
		});

		const callback = getStatusChangedCallback();

		const keyAction = {
			id: 'volume-up-main',
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				zone: 'main',
				direction: 'up'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		keyAction.setTitle.mockClear();
		keyAction.setImage.mockClear();

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(100);

		action.onWillDisappear({
			action: keyAction
		} as never);

		await vi.advanceTimersByTimeAsync(1000);

		expect(mocks.yamaha.changeVolume).toHaveBeenCalledTimes(1);

		callback('main', {
			power: 'On',
			actualVolume: -20
		});

		await vi.advanceTimersByTimeAsync(50);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});
});
