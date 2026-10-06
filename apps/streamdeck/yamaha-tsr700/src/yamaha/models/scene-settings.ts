import type { JsonObject } from '@elgato/utils';

import type { Zone } from '../types';

export interface SceneSettings extends JsonObject {
	zone?: Zone;
	scene?: number | string;
}

export interface GetSceneZonesPayload extends JsonObject {
	event: 'getSceneZones';
}

export interface GetScenesPayload extends JsonObject {
	event: 'getScenes';
}
