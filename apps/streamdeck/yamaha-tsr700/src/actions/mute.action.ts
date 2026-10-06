import { action } from '@elgato/streamdeck';

import { MuteActionImpl } from './mute.action.impl';

/** Registers the mute action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.mute' })
export class MuteAction extends MuteActionImpl {}
