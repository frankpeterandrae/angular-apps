import { action } from '@elgato/streamdeck';

import { NowPlayingActionImpl } from './now-playing.action.impl';

/** Registers the now playing action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.now-playing' })
export class NowPlayingAction extends NowPlayingActionImpl {}
