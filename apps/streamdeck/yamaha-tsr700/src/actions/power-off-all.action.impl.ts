import { KeyDownEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';
import type { JsonObject } from '@elgato/utils';

import { featuresService, statusService, yamaha } from '../services';

export type PowerOffAllSettings = JsonObject;

/** Switches every power-capable receiver zone to standby. */
export class PowerOffAllActionImpl extends SingletonAction<PowerOffAllSettings> {
	/** Initializes the title and image when a keypad action becomes visible. */
	public override async onWillAppear(ev: WillAppearEvent<PowerOffAllSettings>): Promise<void> {
		if (!ev.action.isKey()) {
			return;
		}

		await ev.action.setTitle('All\nStandby');
		await ev.action.setImage('imgs/actions/power-off-all/key');
	}

	/** Switches all power-capable zones to standby and refreshes their displayed status. */
	public override async onKeyDown(_ev: KeyDownEvent<PowerOffAllSettings>): Promise<void> {
		const zones = await featuresService.getPowerZones();

		await Promise.all(zones.map((zone) => yamaha.standby(zone.id)));

		await statusService.refresh();
	}
}
