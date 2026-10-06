import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	statusService: {
		onStatusChanged: vi.fn(),
		getStatus: vi.fn()
	},
	featuresService: {
		getPowerZones: vi.fn(),
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
		powerOn: vi.fn(),
		standby: vi.fn()
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

import { PowerOnActionImpl as PowerOnAction } from './power-on.action.impl';

describe('PowerOnAction', () => {
	let action: PowerOnAction;

	beforeEach(() => {
		vi.clearAllMocks();
		action = new PowerOnAction();
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
		managedAction.actions = [nonKeyAction as never, otherZoneAction as never, matchingAction as never];

		const callback = mocks.statusService.onStatusChanged.mock.calls[0]?.[0] as (
			zone: string,
			status: { power: 'On' | 'Standby' }
		) => void;
		callback('main', { power: 'On' });

		await vi.waitFor(() => {
			expect(matchingAction.setTitle).toHaveBeenCalledWith('Main Zone\nOn');
		});

		expect(matchingAction.setImage).toHaveBeenCalledWith('imgs/actions/power-on/key');
		expect(otherZoneAction.setTitle).not.toHaveBeenCalled();
		expect(nonKeyAction.getSettings).not.toHaveBeenCalled();
	});

	it('updates key title and image on appear for powered on zone', async () => {
		mocks.statusService.getStatus.mockReturnValue({ power: 'On' });

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
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nOn');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/power-on/key');
	});

	it('uses main zone as default when zone setting is not defined on appear', async () => {
		mocks.statusService.getStatus.mockReturnValue({ power: 'On' });

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
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nOn');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/power-on/key');
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

	it('powers on when current state is standby', async () => {
		mocks.statusService.getStatus.mockReturnValue({ power: 'Standby' });

		await action.onKeyDown({
			action: {
				getSettings: vi.fn().mockResolvedValue({ zone: 'zone2' })
			}
		} as never);

		expect(mocks.yamaha.powerOn).toHaveBeenCalledWith('zone2');
		expect(mocks.yamaha.standby).not.toHaveBeenCalled();
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
		expect(mocks.yamaha.powerOn).not.toHaveBeenCalled();
		expect(mocks.yamaha.standby).not.toHaveBeenCalled();
	});

	it('switches to standby when current state is on', async () => {
		mocks.statusService.getStatus.mockReturnValue({ power: 'On' });

		await action.onKeyDown({
			action: {
				getSettings: vi.fn().mockResolvedValue({ zone: 'main' })
			}
		} as never);

		expect(mocks.yamaha.standby).toHaveBeenCalledWith('main');
		expect(mocks.yamaha.powerOn).not.toHaveBeenCalled();
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

	it('falls back to main zone on settings event and updates standby state', async () => {
		mocks.statusService.getStatus.mockReturnValue({ power: 'Standby' });

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
		expect(keyAction.setTitle).toHaveBeenCalledWith('Main Zone\nStandby');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/power-on/key-off');
	});

	it('ignores non-getPowerZones events in onSendToPlugin', async () => {
		await action.onSendToPlugin({
			payload: { event: 'someOtherEvent' }
		} as never);

		expect(mocks.featuresService.getPowerZones).not.toHaveBeenCalled();
		expect(streamDeckMocks.ui.sendToPropertyInspector).not.toHaveBeenCalled();
	});

	it('sends power zones to property inspector on getPowerZones request', async () => {
		mocks.featuresService.getPowerZones.mockResolvedValue([
			{ id: 'main', label: 'Main Zone' },
			{ id: 'zone2', label: 'Zone 2' }
		]);

		await action.onSendToPlugin({
			payload: { event: 'getPowerZones' }
		} as never);

		expect(mocks.featuresService.getPowerZones).toHaveBeenCalledOnce();
		expect(streamDeckMocks.ui.sendToPropertyInspector).toHaveBeenCalledWith({
			event: 'getPowerZones',
			items: [
				{ label: 'Main Zone', value: 'main' },
				{ label: 'Zone 2', value: 'zone2' }
			]
		});
	});
});
