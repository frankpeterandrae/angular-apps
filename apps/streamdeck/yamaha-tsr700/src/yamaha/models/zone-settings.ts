import type { JsonObject } from '@elgato/utils';

import { Zone } from '../types';

export interface ZoneSettings extends JsonObject {
	zone?: Zone;
}
