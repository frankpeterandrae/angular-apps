import streamDeck, {
	type DidReceiveSettingsEvent,
	KeyAction,
	KeyDownEvent,
	type SendToPluginEvent,
	SingletonAction,
	WillAppearEvent
} from '@elgato/streamdeck';

import { featuresService, statusService, yamaha } from '../services';
import { GetScenesPayload, GetSceneZonesPayload, SceneSettings, Zone } from '../yamaha';

type ScenePropertyInspectorPayload = GetSceneZonesPayload | GetScenesPayload;

/** Recalls a configured scene and supplies zone-specific scene choices to the inspector. */
export class SceneActionImpl extends SingletonAction<SceneSettings> {
	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<SceneSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		const settings = await ev.action.getSettings();

		await this.updateAction(ev.action, settings);
	}

	/** Recalls a positive integer scene number and refreshes the displayed zone status. */
	public override async onKeyDown(ev: KeyDownEvent<SceneSettings>): Promise<void> {
		const settings = await ev.action.getSettings();

		const zone = this.getZone(settings);
		const scene = this.getScene(settings);

		if (!scene) {
			return;
		}

		await yamaha.recallScene(zone, scene);
		await statusService.refresh();
	}

	/** Updates the visible key after its property-inspector settings change. */
	public override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<SceneSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		await this.updateAction(ev.action, ev.payload.settings);
	}

	/** Returns supported choices for the requested property-inspector data source. */
	public override async onSendToPlugin(ev: SendToPluginEvent<ScenePropertyInspectorPayload, SceneSettings>): Promise<void> {
		if (ev.payload.event === 'getSceneZones') {
			const zones = await featuresService.getSceneZones();

			await streamDeck.ui.sendToPropertyInspector({
				event: 'getSceneZones',
				items: zones.map((zone) => ({
					label: zone.label,
					value: zone.id
				}))
			});

			return;
		}

		if (ev.payload.event === 'getScenes') {
			const settings = await ev.action.getSettings();
			const zone = this.getZone(settings);

			const scenes = await featuresService.getScenes(zone);

			await streamDeck.ui.sendToPropertyInspector({
				event: 'getScenes',
				items: scenes.map((scene) => ({
					label: scene.label,
					value: scene.id
				}))
			});
		}
	}

	private async updateAction(action: KeyAction<SceneSettings>, settings: SceneSettings): Promise<void> {
		const zone = this.getZone(settings);
		const scene = this.getScene(settings);

		const zoneLabel = featuresService.getZoneLabel(zone);

		await action.setTitle(`${zoneLabel}`);
		await action.setImage(this.getSceneImage(scene));
	}

	private getZone(settings: SceneSettings): Zone {
		return settings.zone ?? 'main';
	}

	private getScene(settings: SceneSettings): number | undefined {
		if (settings.scene === undefined || settings.scene === '') {
			return undefined;
		}

		const scene = Number(settings.scene);

		if (!Number.isInteger(scene) || scene <= 0) {
			return undefined;
		}

		return scene;
	}

	private getSceneImage(scene: number | undefined): string {
		if (!scene) {
			return 'imgs/actions/scene/key';
		}

		return `imgs/actions/scene/circle-number-${scene}`;
	}
}
