import streamDeck, { KeyAction, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from '@elgato/streamdeck';
import type { JsonObject } from '@elgato/utils';

import { yamaha } from '../services';
import type { NetUsbPlayInfo } from '../yamaha';

import { AlbumArtService } from './album-art.service';
import { NowPlayingRenderer } from './now-playing.renderer';

export type NowPlayingSettings = JsonObject;

/** Polls NetUSB playback while keys are visible and updates their titles and images. */
export class NowPlayingActionImpl extends SingletonAction<NowPlayingSettings> {
	private static readonly pollIntervalMs = 3000;

	private readonly visibleActions = new Map<string, KeyAction<NowPlayingSettings>>();
	private timer?: ReturnType<typeof setInterval>;

	private readonly albumArt = new AlbumArtService();
	private readonly renderer = new NowPlayingRenderer();

	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<NowPlayingSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		this.visibleActions.set(ev.action.id, ev.action);
		this.startPolling();

		await this.updateVisibleActions();
	}

	/** Removes the hidden action and releases its polling or repeat timer when no longer needed. */
	public override onWillDisappear(ev: WillDisappearEvent<NowPlayingSettings>): void {
		this.visibleActions.delete(ev.action.id);
		this.stopPollingIfNoActionsAreVisible();
	}

	/** Refreshes all visible playback keys immediately. */
	public override async onKeyDown(_ev: KeyDownEvent<NowPlayingSettings>): Promise<void> {
		await this.updateVisibleActions();
	}

	private startPolling(): void {
		if (this.timer) {
			return;
		}

		this.timer = setInterval(() => {
			void this.updateVisibleActions();
		}, NowPlayingActionImpl.pollIntervalMs);
	}

	private stopPollingIfNoActionsAreVisible(): void {
		if (this.visibleActions.size > 0 || !this.timer) {
			return;
		}

		clearInterval(this.timer);
		this.timer = undefined;
	}

	private async updateVisibleActions(): Promise<void> {
		if (this.visibleActions.size === 0) {
			return;
		}

		let playInfo: NetUsbPlayInfo;

		try {
			playInfo = await yamaha.getNetUsbPlayInfo();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			streamDeck.logger.warn(`Could not load NetUSB play info. ${message}`);

			await Promise.all([...this.visibleActions.values()].map((action) => this.updateUnavailableAction(action)));

			return;
		}

		const albumArtDataUrl = await this.albumArt.resolve(playInfo);

		await Promise.all([...this.visibleActions.values()].map((action) => this.updateAction(action, playInfo, albumArtDataUrl)));
	}

	private async updateAction(action: KeyAction<NowPlayingSettings>, playInfo: NetUsbPlayInfo, albumArtDataUrl?: string): Promise<void> {
		if (albumArtDataUrl) {
			await action.setTitle(this.renderer.createCoverTitle(playInfo));
			await action.setImage(albumArtDataUrl);
			return;
		}

		await action.setTitle('');
		await action.setImage(this.renderer.createNowPlayingImage(playInfo));
	}

	private async updateUnavailableAction(action: KeyAction<NowPlayingSettings>): Promise<void> {
		await action.setTitle('');
		await action.setImage(this.renderer.createUnavailableImage());
	}
}
