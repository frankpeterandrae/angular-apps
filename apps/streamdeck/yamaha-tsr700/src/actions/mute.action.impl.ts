import streamDeck, {
	type DidReceiveSettingsEvent,
	KeyAction,
	KeyDownEvent,
	type SendToPluginEvent,
	SingletonAction,
	WillAppearEvent
} from '@elgato/streamdeck';

import { featuresService, statusService, yamaha } from '../services';
import { GetMuteZonesPayload, Zone, ZoneSettings, ZoneStatus } from '../yamaha';

/** Toggles zone mute and updates visible keys from receiver status changes. */
export class MuteActionImpl extends SingletonAction<ZoneSettings> {
	constructor() {
		super();

		statusService.onStatusChanged((zone, status) => {
			void this.updateActions(zone, status);
		});
	}

	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<ZoneSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const settings = await ev.action.getSettings();
		const zone: Zone = this.getZone(settings);

		const status = statusService.getStatus(zone);

		if (!status) {
			return;
		}

		await this.updateAction(ev.action, zone, status);
	}

	/** Toggles the last known mute state and refreshes zone status after the command. */
	public override async onKeyDown(ev: KeyDownEvent<ZoneSettings>): Promise<void> {
		const settings = await ev.action.getSettings();
		const zone: Zone = this.getZone(settings);

		const status = statusService.getStatus(zone);

		if (!status) {
			return;
		}

		await yamaha.mute(zone, !status.mute);
		await statusService.refresh();
	}

	/** Updates the visible key after its property-inspector settings change. */
	public override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ZoneSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const zone = ev.payload.settings.zone ?? 'main';
		const status = statusService.getStatus(zone);

		if (!status) {
			return;
		}

		await this.updateAction(ev.action, zone, status);
	}

	/** Returns supported choices for the requested property-inspector data source. */
	public override async onSendToPlugin(ev: SendToPluginEvent<GetMuteZonesPayload, ZoneSettings>): Promise<void> {
		if (ev.payload.event !== 'getMuteZones') {
			return;
		}

		const zones = await featuresService.getMuteZones();

		await streamDeck.ui.sendToPropertyInspector({
			event: 'getMuteZones',
			items: zones.map((zone) => ({
				label: zone.label,
				value: zone.id
			}))
		});
	}

	private async updateActions(zone: Zone, status: ZoneStatus): Promise<void> {
		await Promise.all(
			[...this.actions].map(async (action) => {
				if (!action.isKey()) {
					return;
				}

				const settings = await action.getSettings();
				const actionZone = this.getZone(settings);

				if (actionZone !== zone) {
					return;
				}

				await this.updateAction(action, zone, status);
			})
		);
	}

	private getZone(settings: ZoneSettings): Zone {
		return settings.zone ?? 'main';
	}

	private async updateAction(action: KeyAction<ZoneSettings>, zone: Zone, status: ZoneStatus): Promise<void> {
		const title = `${featuresService.getZoneLabel(zone)}`;

		await action.setTitle(title);
		if (status.mute) {
			await action.setImage('imgs/actions/mute/mute');
		} else {
			await action.setImage('imgs/actions/mute/unmute');
		}
	}
}
