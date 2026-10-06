import streamDeck, {
	type DidReceiveSettingsEvent,
	KeyAction,
	KeyDownEvent,
	type SendToPluginEvent,
	SingletonAction,
	WillAppearEvent
} from '@elgato/streamdeck';

import { featuresService, statusService, yamaha } from '../services';
import { GetInputsPayload, GetInputZonesPayload, InputSettings, Zone, ZoneStatus } from '../yamaha';

/** Selects a receiver input and reflects its active state on visible keys. */
export class InputActionImpl extends SingletonAction<InputSettings> {
	constructor() {
		super();

		statusService.onStatusChanged((zone, status) => {
			void this.updateActions(zone, status);
		});
	}

	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<InputSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const settings = await ev.action.getSettings();
		const zone: Zone = this.getZone(settings);

		const status = statusService.getStatus(zone);

		if (!status) {
			return;
		}

		await this.updateAction(ev.action, settings, status);
	}

	/** Selects the configured input; an unconfigured key sends no command. */
	public override async onKeyDown(ev: KeyDownEvent<InputSettings>): Promise<void> {
		const settings = await ev.action.getSettings();

		const zone = this.getZone(settings);
		const input = settings.input;

		if (!input) {
			return;
		}

		await yamaha.setInput(zone, input);
	}

	/** Updates the visible key after its property-inspector settings change. */
	public override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<InputSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const settings = ev.payload.settings;
		const zone = this.getZone(settings);
		const status = statusService.getStatus(zone);

		if (!status) {
			return;
		}

		await this.updateAction(ev.action, settings, status);
	}

	/** Returns supported choices for the requested property-inspector data source. */
	public override async onSendToPlugin(ev: SendToPluginEvent<GetInputZonesPayload | GetInputsPayload, InputSettings>): Promise<void> {
		if (ev.payload.event === 'getInputZones') {
			const zones = await featuresService.getInputZones();

			await streamDeck.ui.sendToPropertyInspector({
				event: 'getInputZones',
				items: zones.map((zone) => ({
					label: zone.label,
					value: zone.id
				}))
			});

			return;
		}

		if (ev.payload.event === 'getInputs') {
			const settings = await ev.action.getSettings();
			const zone = this.getZone(settings);

			const inputs = await featuresService.getInputs(zone);

			await streamDeck.ui.sendToPropertyInspector({
				event: 'getInputs',
				items: inputs.map((input) => ({
					label: input.label,
					value: input.id
				}))
			});
		}
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

				await this.updateAction(action, settings, status);
			})
		);
	}

	private getZone(settings: InputSettings): Zone {
		return settings.zone ?? 'main';
	}

	private async updateAction(action: KeyAction<InputSettings>, settings: InputSettings, status: ZoneStatus): Promise<void> {
		const zone = this.getZone(settings);
		const input = settings.input;

		const zoneLabel = featuresService.getZoneLabel(zone);
		const inputLabel = input ? await this.getInputLabel(zone, input) : 'No input selected';

		const isActive = input !== undefined && status.input === input;

		await action.setTitle(`${zoneLabel}\n${inputLabel}`);

		await action.setImage(this.getInputImage(input, isActive));
	}

	private async getInputLabel(zone: Zone, inputId: string): Promise<string> {
		const inputs = await featuresService.getInputs(zone);

		return inputs.find((input) => input.id === inputId)?.label ?? inputId;
	}

	private getInputImage(input: string | undefined, active: boolean): string {
		if (!input) {
			return 'imgs/actions/input/icon';
		}

		const suffix = active ? '-active' : '';

		switch (input) {
			case 'airplay':
				return `imgs/actions/input/airplay${suffix}`;
			case 'amazon_music':
				return `imgs/actions/input/amazon-music${suffix}`;
			case 'audio1':
			case 'audio2':
			case 'audio3':
			case 'audio4':
			case 'audio5':
				return `imgs/actions/input/audio${suffix}`;
			case 'bluetooth':
				return `imgs/actions/input/bluetooth${suffix}`;
			case 'deezer':
				return `imgs/actions/input/deezer${suffix}`;
			case 'hdmi1':
			case 'hdmi2':
			case 'hdmi3':
			case 'hdmi4':
			case 'hdmi5':
			case 'hdmi6':
			case 'hdmi7':
				return `imgs/actions/input/hdmi${suffix}`;
			case 'main_sync':
			case 'mc_link':
				return `imgs/actions/input/audio${suffix}`;
			case 'napster':
				return `imgs/actions/input/napster${suffix}`;
			case 'net_radio':
				return `imgs/actions/input/net-radio${suffix}`;
			case 'phono':
				return `imgs/actions/input/phono${suffix}`;
			case 'qobuz':
				return `imgs/actions/input/qobuz${suffix}`;
			case 'server':
				return `imgs/actions/input/server${suffix}`;
			case 'spotify':
				return `imgs/actions/input/spotify${suffix}`;
			case 'tidal':
				return `imgs/actions/input/tidal${suffix}`;
			case 'tuner':
				return `imgs/actions/input/tuner${suffix}`;
			case 'tv':
				return `imgs/actions/input/tv${suffix}`;
			case 'usb':
				return `imgs/actions/input/usb${suffix}`;
			default:
				return `imgs/actions/input/audio${suffix}`;
		}
	}
}
