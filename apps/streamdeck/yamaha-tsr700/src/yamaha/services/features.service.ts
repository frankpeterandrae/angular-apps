import streamDeck from '@elgato/streamdeck';

import type {
	InputOption,
	SceneOption,
	SoundProgramOption,
	YamahaExtendedFeatures,
	YamahaExtendedZoneFeatures,
	YamahaNameTexts,
	ZoneOption
} from '../models';
import type { Zone } from '../types';
import type { YamahaClient } from '../yamaha-client';

type YamahaFeaturesClient = Pick<YamahaClient, 'getFeatures' | 'getNameTexts'>;

/** Caches receiver capabilities and names and exposes supported property-inspector choices. */
export class FeaturesService {
	// Pending capability and name requests must not repopulate an invalidated receiver cache.
	private generation = 0;
	private features?: YamahaExtendedFeatures;
	private nameTexts?: YamahaNameTexts;

	constructor(private readonly yamaha: YamahaFeaturesClient) {}

	/** Returns cached capabilities; invalidated in-flight responses are fetched again. */
	public async getFeatures(): Promise<YamahaExtendedFeatures> {
		const generation = this.generation;
		const features = this.features ?? (await this.yamaha.getFeatures());
		if (generation !== this.generation) return this.getFeatures();
		this.features = features;
		return features;
	}

	/** Invalidates receiver capabilities and names, including responses still in flight. */
	public clearCache(): void {
		this.generation++;
		this.features = undefined;
		this.nameTexts = undefined;
	}

	/** Invalidates capability and name caches and reloads receiver capabilities. */
	public async refresh(): Promise<YamahaExtendedFeatures> {
		this.clearCache();

		return this.getFeatures();
	}

	/** Returns all advertised zones with their display labels. */
	public async getZones(): Promise<ZoneOption[]> {
		const features = await this.getFeatures();

		return features.zone.map((zone) => ({
			id: zone.id,
			label: this.getZoneLabel(zone.id)
		}));
	}

	/** Returns only zones that advertise power control. */
	public async getPowerZones(): Promise<ZoneOption[]> {
		const features = await this.getFeatures();

		return features.zone
			.filter((zone) => this.hasFunction(zone, 'power'))
			.map((zone) => ({
				id: zone.id,
				label: this.getZoneLabel(zone.id)
			}));
	}

	/** Returns only zones that advertise volume control. */
	public async getVolumeZones(): Promise<ZoneOption[]> {
		const features = await this.getFeatures();

		return features.zone
			.filter((zone) => this.hasFunction(zone, 'volume'))
			.map((zone) => ({
				id: zone.id,
				label: this.getZoneLabel(zone.id)
			}));
	}

	/** Returns only zones that advertise mute control. */
	public async getMuteZones(): Promise<ZoneOption[]> {
		const features = await this.getFeatures();

		return features.zone
			.filter((zone) => this.hasFunction(zone, 'mute'))
			.map((zone) => ({
				id: zone.id,
				label: this.getZoneLabel(zone.id)
			}));
	}

	/** Returns only zones with selectable inputs. */
	public async getInputZones(): Promise<ZoneOption[]> {
		const features = await this.getFeatures();

		return features.zone
			.filter((zone) => zone.input_list?.length)
			.map((zone) => ({
				id: zone.id,
				label: this.getZoneLabel(zone.id)
			}));
	}

	/** Returns inputs for the zone, falling back to formatted IDs when receiver names are unavailable. */
	public async getInputs(zone: Zone): Promise<InputOption[]> {
		const features = await this.getFeatures();
		const nameTexts = await this.getNameTextsOrUndefined();

		const zoneFeatures = this.findZone(features, zone);

		if (!zoneFeatures?.input_list) {
			return [];
		}

		return zoneFeatures.input_list.map((inputId) => ({
			id: inputId,
			label: this.getInputLabel(nameTexts?.input_list ?? [], inputId)
		}));
	}

	private async getNameTextsOrUndefined(): Promise<YamahaNameTexts | undefined> {
		try {
			return await this.getNameTexts();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			streamDeck.logger.warn(`Could not load Yamaha name texts. Falling back to formatted input ids. ${message}`);

			return undefined;
		}
	}

	private getInputLabel(inputs: Array<{ id: string; text: string }>, inputId: string): string {
		const input = inputs.find((item) => item.id === inputId);

		return input?.text ?? this.formatId(inputId);
	}

	/** Returns numbered scenes when the zone advertises scene support. */
	public async getScenes(zone: Zone): Promise<SceneOption[]> {
		const features = await this.getFeatures();

		const zoneFeatures = this.findZone(features, zone);

		if (!zoneFeatures || !this.hasFunction(zoneFeatures, 'scene') || !zoneFeatures.scene_num) {
			return [];
		}

		return Array.from({ length: zoneFeatures.scene_num }, (_, index) => {
			const sceneNumber = index + 1;

			return {
				id: sceneNumber,
				label: `Scene ${sceneNumber}`
			};
		});
	}

	/** Returns advertised sound programs with readable labels. */
	public async getSoundPrograms(zone: Zone): Promise<SoundProgramOption[]> {
		const features = await this.getFeatures();

		const zoneFeatures = this.findZone(features, zone);

		if (!zoneFeatures || !this.hasFunction(zoneFeatures, 'sound_program') || !zoneFeatures.sound_program_list) {
			return [];
		}

		return zoneFeatures.sound_program_list.map((program) => ({
			id: program,
			label: this.formatId(program)
		}));
	}

	private findZone(features: YamahaExtendedFeatures, zone: Zone): YamahaExtendedZoneFeatures | undefined {
		return features.zone.find((item) => item.id === zone);
	}

	private hasFunction(zone: YamahaExtendedZoneFeatures, functionName: string): boolean {
		return zone.func_list.includes(functionName);
	}

	/** Returns the display label for a supported receiver zone. */
	public getZoneLabel(zone: Zone): string {
		switch (zone) {
			case 'main':
				return 'Main Zone';
			case 'zone2':
				return 'Zone 2';
			case 'zone3':
				return 'Zone 3';
			case 'zone4':
				return 'Zone 4';
		}
	}

	private formatId(id: string): string {
		return id
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	/** Returns cached receiver names; invalidated in-flight responses are fetched again. */
	public async getNameTexts(): Promise<YamahaNameTexts> {
		const generation = this.generation;
		const nameTexts = this.nameTexts ?? (await this.yamaha.getNameTexts());
		if (generation !== this.generation) return this.getNameTexts();
		this.nameTexts = nameTexts;
		return nameTexts;
	}

	/** Returns zones that support at least one scene. */
	public async getSceneZones(): Promise<ZoneOption[]> {
		const features = await this.getFeatures();

		return features.zone
			.filter((zone) => this.hasFunction(zone, 'scene') && zone.scene_num)
			.map((zone) => ({
				id: zone.id,
				label: this.getZoneLabel(zone.id)
			}));
	}
}
