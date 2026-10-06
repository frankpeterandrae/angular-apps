import type { JsonObject } from '@elgato/utils';

import type { VolumeDirection, Zone } from '../types';

export interface VolumeSettings extends JsonObject {
	zone?: Zone;
	direction?: VolumeDirection;
}
