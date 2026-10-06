import { action } from '@elgato/streamdeck';

import { VolumeActionImpl } from './volume.action.impl';

/** Registers the volume action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.volume' })
export class VolumeAction extends VolumeActionImpl {}
