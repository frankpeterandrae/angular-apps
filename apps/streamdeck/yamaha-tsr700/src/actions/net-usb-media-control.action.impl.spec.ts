import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	yamaha: {
		setNetUsbPlayback: vi.fn()
	}
}));

vi.mock('../services', () => ({
	yamaha: mocks.yamaha
}));

vi.mock('@elgato/streamdeck', () => ({
	action: () => (target: unknown) => target,
	SingletonAction: class {
		public actions: unknown[] = [];
	}
}));

import { NetUsbMediaControlActionImpl } from './net-usb-media-control.action.impl';

describe('NetUsbMediaControlActionImpl', () => {
	let action: NetUsbMediaControlActionImpl;

	beforeEach(() => {
		vi.clearAllMocks();

		mocks.yamaha.setNetUsbPlayback.mockResolvedValue(undefined);

		action = new NetUsbMediaControlActionImpl();
	});

	it('sets title and image on appear for play_pause', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({
				command: 'play_pause'
			}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.getSettings).toHaveBeenCalledOnce();
		expect(keyAction.setTitle).toHaveBeenCalledWith('Play /\nPause');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/net-usb-media-control/play-pause');
	});

	it('sets default title and image on appear when no command is configured', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({}),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('NetUSB');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/net-usb-media-control/default');
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

	it('sends configured playback command on key down', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				command: 'next'
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).toHaveBeenCalledWith('next');
	});

	it('does nothing on key down when no command is configured', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).not.toHaveBeenCalled();
	});

	it('updates title and image on settings change', async () => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onDidReceiveSettings({
			action: keyAction,
			payload: {
				settings: {
					command: 'stop'
				}
			}
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith('Stop');
		expect(keyAction.setImage).toHaveBeenCalledWith('imgs/actions/net-usb-media-control/stop');
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
					command: 'stop'
				}
			}
		} as never);

		expect(keyAction.setTitle).not.toHaveBeenCalled();
		expect(keyAction.setImage).not.toHaveBeenCalled();
	});

	it.each([
		['play', 'Play', 'imgs/actions/net-usb-media-control/play'],
		['pause', 'Pause', 'imgs/actions/net-usb-media-control/pause'],
		['play_pause', 'Play /\nPause', 'imgs/actions/net-usb-media-control/play-pause'],
		['stop', 'Stop', 'imgs/actions/net-usb-media-control/stop'],
		['previous', 'Previous', 'imgs/actions/net-usb-media-control/previous'],
		['next', 'Next', 'imgs/actions/net-usb-media-control/next'],
		['fast_reverse', 'Rewind', 'imgs/actions/net-usb-media-control/rewind'],
		['fast_forward', 'Forward', 'imgs/actions/net-usb-media-control/forward']
	])('sets expected title and image for command %s', async (command, expectedTitle, expectedImage) => {
		const keyAction = {
			isKey: vi.fn().mockReturnValue(true),
			getSettings: vi.fn().mockResolvedValue({ command }),
			setTitle: vi.fn().mockResolvedValue(undefined),
			setImage: vi.fn().mockResolvedValue(undefined)
		};

		await action.onWillAppear({
			action: keyAction
		} as never);

		expect(keyAction.setTitle).toHaveBeenCalledWith(expectedTitle);
		expect(keyAction.setImage).toHaveBeenCalledWith(expectedImage);
	});

	it.each([
		['play', 'play'],
		['pause', 'pause'],
		['play_pause', 'play_pause'],
		['stop', 'stop'],
		['previous', 'previous'],
		['next', 'next'],
		['fast_reverse', 'fast_reverse_start'],
		['fast_forward', 'fast_forward_start']
	])('sends command %s on key down as %s', async (settingCommand, expectedPlaybackCommand) => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				command: settingCommand
			})
		};

		await action.onKeyDown({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).toHaveBeenCalledWith(expectedPlaybackCommand);
	});

	it('sends fast_reverse_end on key up for fast_reverse', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				command: 'fast_reverse'
			})
		};

		await action.onKeyUp({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).toHaveBeenCalledWith('fast_reverse_end');
	});

	it('sends fast_forward_end on key up for fast_forward', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				command: 'fast_forward'
			})
		};

		await action.onKeyUp({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).toHaveBeenCalledWith('fast_forward_end');
	});

	it('does nothing on key up for normal commands', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({
				command: 'play_pause'
			})
		};

		await action.onKeyUp({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).not.toHaveBeenCalled();
	});

	it('does nothing on key up when no command is configured', async () => {
		const keyAction = {
			getSettings: vi.fn().mockResolvedValue({})
		};

		await action.onKeyUp({
			action: keyAction
		} as never);

		expect(mocks.yamaha.setNetUsbPlayback).not.toHaveBeenCalled();
	});
});
