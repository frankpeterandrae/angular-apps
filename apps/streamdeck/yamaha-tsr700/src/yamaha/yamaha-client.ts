import { YamahaExtendedControlClient } from './http';
import { NetUsbPlayInfo, YamahaExtendedFeatures, YamahaNameTexts, ZoneStatus } from './models';
import type { NetUsbPlaybackCommand, VolumeDirection, Zone } from './types';

/** Provides the receiver commands used by actions independently of the HTTP transport. */
export class YamahaClient {
	constructor(private readonly extendedControlClient: YamahaExtendedControlClient) {}

	/** Loads the receiver capabilities used to discover supported zones and controls. */
	public async getFeatures(): Promise<YamahaExtendedFeatures> {
		return this.extendedControlClient.getFeatures();
	}

	/** Switches the requested zone on. */
	public async powerOn(zone: Zone): Promise<void> {
		await this.extendedControlClient.powerOn(zone);
	}

	/** Switches the requested zone to standby. */
	public async standby(zone: Zone): Promise<void> {
		await this.extendedControlClient.standby(zone);
	}

	/** Selects an input in the requested zone. */
	public async setInput(zone: Zone, input: string): Promise<void> {
		await this.extendedControlClient.setInput(zone, input);
	}

	/** Enables or disables mute in the requested zone. */
	public async mute(zone: Zone, enabled: boolean): Promise<void> {
		await this.extendedControlClient.mute(zone, enabled);
	}

	/** Loads zone status, including power, mute, volume and the selected input. */
	public async getBasicStatus(zone: Zone): Promise<ZoneStatus> {
		return this.extendedControlClient.getBasicStatus(zone);
	}

	/** Requests one receiver-defined volume step in the given direction. */
	public async changeVolume(zone: Zone, direction: VolumeDirection): Promise<void> {
		await this.extendedControlClient.changeVolume(zone, direction);
	}

	/** Loads the receiver-defined names for zones, inputs and sound programs. */
	public async getNameTexts(): Promise<YamahaNameTexts> {
		return this.extendedControlClient.getNameTexts();
	}

	/** Recalls the numbered scene in the requested zone. */
	public async recallScene(zone: Zone, scene: number): Promise<void> {
		await this.extendedControlClient.recallScene(zone, scene);
	}

	/** Sends a playback command to the receiver-wide NetUSB player. */
	public async setNetUsbPlayback(command: NetUsbPlaybackCommand): Promise<void> {
		await this.extendedControlClient.setNetUsbPlayback(command);
	}

	/** Loads NetUSB playback metadata and resolves relative artwork URLs against the receiver address. */
	public async getNetUsbPlayInfo(): Promise<NetUsbPlayInfo> {
		return this.extendedControlClient.getNetUsbPlayInfo();
	}
}
