import type { JsonObject } from '@elgato/utils';

import type { NetUsbMediaControlCommand } from '../types';

export interface NetUsbMediaControlSettings extends JsonObject {
	command?: NetUsbMediaControlCommand;
}
