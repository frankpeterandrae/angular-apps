/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import streamDeck from '@elgato/streamdeck';

import { InputAction } from './actions/input.action';
import { MuteAction } from './actions/mute.action';
import { NetUsbMediaControlAction } from './actions/net-usb-media-control.action';
import { NowPlayingAction } from './actions/now-playing.action';
import { PowerOffAllAction } from './actions/power-off-all.action';
import { PowerOnAction } from './actions/power-on.action';
import { SceneAction } from './actions/scene.action';
import { VolumeAction } from './actions/volume.action';
import { featuresService, settings, statusService } from './services';
import type { YamahaGlobalSettings } from './yamaha';

streamDeck.logger.setLevel('debug');

streamDeck.actions.registerAction(new PowerOnAction());
streamDeck.actions.registerAction(new VolumeAction());
streamDeck.actions.registerAction(new MuteAction());
streamDeck.actions.registerAction(new InputAction());
streamDeck.actions.registerAction(new PowerOffAllAction());
streamDeck.actions.registerAction(new SceneAction());
streamDeck.actions.registerAction(new NetUsbMediaControlAction());
streamDeck.actions.registerAction(new NowPlayingAction());

streamDeck.settings.onDidReceiveGlobalSettings<YamahaGlobalSettings>((event) => {
	if (!settings.hasReceiverChanged(event.settings)) return;
	featuresService.clearCache();
	void statusService.reset().catch((error: unknown) => {
		streamDeck.logger.warn(`Could not refresh Yamaha status after settings change. ${String(error)}`);
	});
});

await streamDeck.connect();

await statusService.start();
