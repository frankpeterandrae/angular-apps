import streamDeck from '@elgato/streamdeck';

import type { YamahaNameTexts, ZoneStatus } from '../models';
import { NetUsbPlaybackStatus, NetUsbPlayInfo, YamahaExtendedFeatures } from '../models';
import type { SettingsService } from '../services';
import type { NetUsbPlaybackCommand, VolumeDirection, Zone } from '../types';

interface YamahaExtendedResponse {
	response_code: number;
}

interface YamahaExtendedFeaturesResponse extends YamahaExtendedResponse, YamahaExtendedFeatures {}

interface YamahaExtendedZoneStatusResponse extends YamahaExtendedResponse {
	power: 'on' | 'standby';
	mute?: boolean;
	volume: number;
	max_volume: number;
	actual_volume?: {
		mode: 'db' | 'numeric';
		value: number;
		unit: string;
	};
	input_text: string;
	input: string;
}

interface YamahaNameTextsResponse extends YamahaExtendedResponse {
	zone_list: Array<{
		id: string;
		text: string;
	}>;
	input_list: Array<{
		id: string;
		text: string;
	}>;
	sound_program_list: Array<{
		id: string;
		text: string;
	}>;
}

interface YamahaNetUsbPlayInfoResponse extends YamahaExtendedResponse {
	input: string;
	playback: NetUsbPlaybackStatus;
	repeat?: string;
	shuffle?: string;
	play_time?: number;
	total_time?: number;
	artist?: string;
	album?: string;
	track?: string;
	albumart_url?: string;
	albumart_id?: number;
}

/** Calls Yamaha Extended Control and maps receiver responses to the plugin models. */
export class YamahaExtendedControlClient {
	constructor(private readonly settings: Pick<SettingsService, 'getReceiverAddress'>) {}

	/** Loads the receiver capabilities used to discover supported zones and controls. */
	public async getFeatures(): Promise<YamahaExtendedFeatures> {
		const response = await this.get<YamahaExtendedFeaturesResponse>('system', 'getFeatures');

		streamDeck.logger.debug(response);
		return {
			system: response.system,
			zone: response.zone
		};
	}

	/** Switches the requested zone on. */
	public async powerOn(zone: Zone): Promise<void> {
		await this.get(zone, 'setPower', {
			power: 'on'
		});
	}

	/** Switches the requested zone to standby. */
	public async standby(zone: Zone): Promise<void> {
		await this.get(zone, 'setPower', {
			power: 'standby'
		});
	}

	/** Selects an input in the requested zone. */
	public async setInput(zone: Zone, input: string): Promise<void> {
		streamDeck.logger.debug('setInput', zone, input);
		await this.get(zone, 'setInput', {
			input
		});
	}

	/** Enables or disables mute in the requested zone. */
	public async mute(zone: Zone, enabled: boolean): Promise<void> {
		await this.get(zone, 'setMute', {
			enable: String(enabled)
		});
	}

	/** Loads zone status, including power, mute, volume and the selected input. */
	public async getBasicStatus(zone: Zone): Promise<ZoneStatus> {
		const response = await this.get<YamahaExtendedZoneStatusResponse>(zone, 'getStatus');

		return {
			power: response.power === 'on' ? 'On' : 'Standby',
			mute: response.mute,
			volume: response.volume,
			maxVolume: response.max_volume,
			actualVolume: response.actual_volume?.value,
			input: response.input,
			inputText: response.input_text
		};
	}

	/** Returns only zones that advertise power control. */
	public async getPowerZones(): Promise<Zone[]> {
		const features = await this.getFeatures();

		return features.zone.filter((zone) => zone.func_list.includes('power')).map((zone) => zone.id);
	}

	private async get<TResponse extends YamahaExtendedResponse>(
		section: string,
		action: string,
		params: Record<string, string> = {}
	): Promise<TResponse> {
		const url = await this.createUrl(section, action, params);
		let response: Response;
		try {
			response = await fetch(url, {
				method: 'GET',
				signal: AbortSignal.timeout(5000)
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			throw new Error(`Yamaha Extended Control request failed for ${url}: ${message}`, { cause: error });
		}
		if (!response.ok) {
			throw new Error(`Yamaha Extended Control request failed with HTTP ${response.status}.`);
		}

		const json = (await response.json()) as TResponse;

		if (json.response_code !== 0) {
			throw new Error(`Yamaha Extended Control returned response_code=${json.response_code}.`);
		}

		streamDeck.logger.debug('response', json);

		return json;
	}

	private async createUrl(section: string, action: string, params: Record<string, string>): Promise<string> {
		const receiverAddress = await this.settings.getReceiverAddress();

		const url = new URL(`http://${receiverAddress}/YamahaExtendedControl/v1/${section}/${action}`);

		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}

		return url.toString();
	}

	/** Requests one receiver-defined volume step in the given direction. */
	public async changeVolume(zone: Zone, direction: VolumeDirection): Promise<void> {
		await this.get(zone, 'setVolume', {
			volume: direction
		});
	}

	/** Loads the receiver-defined names for zones, inputs and sound programs. */
	public async getNameTexts(): Promise<YamahaNameTexts> {
		const response = await this.get<YamahaNameTextsResponse>('system', 'getNameText');

		return {
			zone_list: response.zone_list,
			input_list: response.input_list,
			sound_program_list: response.sound_program_list
		};
	}

	/** Recalls the numbered scene in the requested zone. */
	public async recallScene(zone: Zone, scene: number): Promise<void> {
		await this.get(zone, 'recallScene', {
			num: String(scene)
		});
	}

	/** Sends a playback command to the receiver-wide NetUSB player. */
	public async setNetUsbPlayback(command: NetUsbPlaybackCommand): Promise<void> {
		await this.get('netusb', 'setPlayback', {
			playback: command
		});
	}

	/** Loads NetUSB playback metadata and resolves relative artwork URLs against the receiver address. */
	public async getNetUsbPlayInfo(): Promise<NetUsbPlayInfo> {
		const response = await this.get<YamahaNetUsbPlayInfoResponse>('netusb', 'getPlayInfo');

		const albumArtUrl = await this.resolveReceiverUrl(response.albumart_url);

		streamDeck.logger.debug('NetUSB play info album art', {
			albumart_url: response.albumart_url,
			albumArtUrl,
			albumart_id: response.albumart_id
		});

		return {
			input: response.input,
			playback: response.playback,
			repeat: response.repeat,
			shuffle: response.shuffle,
			playTime: response.play_time,
			totalTime: response.total_time,
			artist: response.artist,
			album: response.album,
			track: response.track,
			albumArtUrl,
			albumArtId: response.albumart_id
		};
	}

	private async resolveReceiverUrl(path: string | undefined): Promise<string | undefined> {
		if (!path?.trim()) {
			return undefined;
		}

		const receiverAddress = await this.settings.getReceiverAddress();
		const baseUrl = new URL(`http://${receiverAddress}/`);

		return new URL(path, baseUrl).toString();
	}
}
