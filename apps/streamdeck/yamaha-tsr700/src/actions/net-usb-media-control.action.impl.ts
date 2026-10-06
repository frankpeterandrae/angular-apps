import { type DidReceiveSettingsEvent, KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';

import { yamaha } from '../services';
import type { NetUsbMediaControlCommand, NetUsbMediaControlSettings, NetUsbPlaybackCommand } from '../yamaha';

/** Maps key presses and releases to NetUSB playback and seek commands. */
export class NetUsbMediaControlActionImpl extends SingletonAction<NetUsbMediaControlSettings> {
	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<NetUsbMediaControlSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const settings = await ev.action.getSettings();

		await ev.action.setTitle(this.getTitle(settings.command));
		await ev.action.setImage(this.getImage(settings.command));
	}

	/** Sends the configured playback command, starting seek commands until key release. */
	public override async onKeyDown(ev: KeyDownEvent<NetUsbMediaControlSettings>): Promise<void> {
		const settings = await ev.action.getSettings();
		const command = this.getKeyDownCommand(settings.command);

		if (!command) {
			return;
		}

		await yamaha.setNetUsbPlayback(command);
	}

	/** Stops the command that runs while the key is held. */
	public override async onKeyUp(ev: KeyUpEvent<NetUsbMediaControlSettings>): Promise<void> {
		const settings = await ev.action.getSettings();
		const command = this.getKeyUpCommand(settings.command);

		if (!command) {
			return;
		}

		await yamaha.setNetUsbPlayback(command);
	}

	/** Updates the visible key after its property-inspector settings change. */
	public override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<NetUsbMediaControlSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		await ev.action.setTitle(this.getTitle(ev.payload.settings.command));
		await ev.action.setImage(this.getImage(ev.payload.settings.command));
	}

	private getKeyDownCommand(command: NetUsbMediaControlCommand | undefined): NetUsbPlaybackCommand | undefined {
		switch (command) {
			case 'fast_reverse':
				return 'fast_reverse_start';
			case 'fast_forward':
				return 'fast_forward_start';
			default:
				return command;
		}
	}

	private getKeyUpCommand(command: NetUsbMediaControlCommand | undefined): NetUsbPlaybackCommand | undefined {
		switch (command) {
			case 'fast_reverse':
				return 'fast_reverse_end';
			case 'fast_forward':
				return 'fast_forward_end';
			default:
				return undefined;
		}
	}

	private getTitle(command: NetUsbMediaControlCommand | undefined): string {
		switch (command) {
			case 'play':
				return 'Play';
			case 'pause':
				return 'Pause';
			case 'play_pause':
				return 'Play /\nPause';
			case 'stop':
				return 'Stop';
			case 'previous':
				return 'Previous';
			case 'next':
				return 'Next';
			case 'fast_reverse':
				return 'Rewind';
			case 'fast_forward':
				return 'Forward';
			default:
				return 'NetUSB';
		}
	}

	private getImage(command: NetUsbMediaControlCommand | undefined): string {
		switch (command) {
			case 'play':
				return 'imgs/actions/net-usb-media-control/play';
			case 'pause':
				return 'imgs/actions/net-usb-media-control/pause';
			case 'play_pause':
				return 'imgs/actions/net-usb-media-control/play-pause';
			case 'stop':
				return 'imgs/actions/net-usb-media-control/stop';
			case 'previous':
				return 'imgs/actions/net-usb-media-control/previous';
			case 'next':
				return 'imgs/actions/net-usb-media-control/next';
			case 'fast_reverse':
				return 'imgs/actions/net-usb-media-control/rewind';
			case 'fast_forward':
				return 'imgs/actions/net-usb-media-control/forward';
			default:
				return 'imgs/actions/net-usb-media-control/default';
		}
	}
}
