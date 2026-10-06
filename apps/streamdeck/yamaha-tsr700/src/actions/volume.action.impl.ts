import streamDeck, {
	DidReceiveSettingsEvent,
	KeyAction,
	KeyDownEvent,
	KeyUpEvent,
	SendToPluginEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent
} from '@elgato/streamdeck';

import { featuresService, statusService, yamaha } from '../services';
import { GetVolumeZonesPayload, VolumeDirection, VolumeSettings, Zone, ZoneOption, ZoneStatus } from '../yamaha';

import { createVolumeImage, hasReachedVolumeLimit } from './volume.helpers';

type VolumeRepeatTimer = {
	delay?: ReturnType<typeof setTimeout>;
	interval?: ReturnType<typeof setInterval>;
};

/** Changes zone volume, repeats while pressed and stops at the configured volume limits. */
export class VolumeActionImpl extends SingletonAction<VolumeSettings> {
	private readonly visibleActions = new Map<string, KeyAction<VolumeSettings>>();
	private readonly presses = new Map<string, object>();
	private readonly repeatTimers = new Map<string, VolumeRepeatTimer>();

	private static readonly repeatDelay = 300;
	private static readonly repeatInterval = 50;

	constructor() {
		super();

		statusService.onStatusChanged((zone, status) => {
			void this.updateVisibleActions(zone, status);
		});
	}

	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<VolumeSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		this.visibleActions.set(ev.action.id, ev.action);

		const settings = await ev.action.getSettings();
		const zone = this.getZone(settings);
		const status = statusService.getStatus(zone);

		if (status) {
			await this.updateAction(ev.action, settings, status);
		}
	}

	/** Updates the visible key after its property-inspector settings change. */
	public override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<VolumeSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const settings = await ev.action.getSettings();
		const zone = this.getZone(settings);
		const status = statusService.getStatus(zone);

		if (status) {
			await this.updateAction(ev.action, settings, status);
		}
	}

	/** Changes volume once, then repeats sequentially while this press remains active. */
	public override async onKeyDown(ev: KeyDownEvent<VolumeSettings>): Promise<void> {
		this.stopRepeating(ev.action.id);
		const press = {};
		this.presses.set(ev.action.id, press);
		const settings = await ev.action.getSettings();
		const zone = this.getZone(settings);
		const direction = this.getDirection(settings);
		if (this.presses.get(ev.action.id) !== press) return;
		try {
			await this.changeVolume(ev.action.id, zone, direction);
		} catch (error) {
			this.stopRepeating(ev.action.id);
			throw error;
		}
		if (this.presses.get(ev.action.id) !== press) return;
		const repeat = async (): Promise<void> => {
			if (this.presses.get(ev.action.id) !== press) return;
			try {
				await this.changeVolume(ev.action.id, zone, direction);
			} catch (error) {
				streamDeck.logger.warn(`Could not change Yamaha volume. ${String(error)}`);
				this.stopRepeating(ev.action.id);
			}
			if (this.presses.get(ev.action.id) === press) {
				this.repeatTimers.set(ev.action.id, {
					delay: setTimeout(() => {
						void repeat();
					}, VolumeActionImpl.repeatInterval)
				});
			}
		};
		this.repeatTimers.set(ev.action.id, {
			delay: setTimeout(() => {
				void repeat();
			}, VolumeActionImpl.repeatDelay)
		});
	}

	/** Stops the command that runs while the key is held. */
	public override onKeyUp(ev: KeyUpEvent<VolumeSettings>): void {
		this.stopRepeating(ev.action.id);
	}

	/** Returns supported choices for the requested property-inspector data source. */
	public override async onSendToPlugin(ev: SendToPluginEvent<GetVolumeZonesPayload, VolumeSettings>): Promise<void> {
		if (ev.payload.event !== 'getVolumeZones') {
			return;
		}

		const zones = await featuresService.getVolumeZones();

		await streamDeck.ui.sendToPropertyInspector({
			event: 'getVolumeZones',
			items: zones.map((zone) => ({
				label: zone.label,
				value: zone.id
			}))
		});
	}

	/** Removes the hidden action and releases its polling or repeat timer when no longer needed. */
	public override onWillDisappear(ev: WillDisappearEvent<VolumeSettings>): void {
		this.stopRepeating(ev.action.id);
		this.visibleActions.delete(ev.action.id);
	}

	private async updateAction(action: KeyAction<VolumeSettings>, settings: VolumeSettings, status: ZoneStatus): Promise<void> {
		const zone = this.getZone(settings);
		const direction = this.getDirection(settings);

		const zoneLabel = await this.getZoneLabel(zone);

		await action.setTitle(`${zoneLabel}`);
		await action.setImage(createVolumeImage(status, direction));
	}

	private getZone(settings: VolumeSettings): Zone {
		return settings.zone ?? 'main';
	}

	private getDirection(settings: VolumeSettings): VolumeDirection {
		return settings.direction ?? 'up';
	}

	private async getZoneLabel(zone: Zone): Promise<string> {
		const zones: ZoneOption[] = await featuresService.getZones();

		return zones.find((item) => item.id === zone)?.label ?? zone;
	}

	private async updateVisibleActions(zone: Zone, status: ZoneStatus): Promise<void> {
		await Promise.all(
			[...this.visibleActions.values()].map(async (action) => {
				const settings = await action.getSettings();

				if (this.getZone(settings) !== zone) {
					return;
				}

				await this.updateAction(action, settings, status);
			})
		);
	}

	private async changeVolume(actionId: string, zone: Zone, direction: VolumeDirection): Promise<void> {
		if (this.hasReachedLimit(zone, direction)) {
			this.stopRepeating(actionId);
			return;
		}

		await yamaha.changeVolume(zone, direction);
	}

	private hasReachedLimit(zone: Zone, direction: VolumeDirection): boolean {
		return hasReachedVolumeLimit(statusService.getStatus(zone), direction);
	}

	private stopRepeating(actionId: string): void {
		this.presses.delete(actionId);
		const timer = this.repeatTimers.get(actionId);

		if (!timer) {
			return;
		}

		if (timer.delay) {
			clearTimeout(timer.delay);
		}

		if (timer.interval) {
			clearInterval(timer.interval);
		}

		this.repeatTimers.delete(actionId);
	}
}
