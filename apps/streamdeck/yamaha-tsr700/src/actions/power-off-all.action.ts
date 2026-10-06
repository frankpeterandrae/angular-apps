import { action } from '@elgato/streamdeck';

import { PowerOffAllActionImpl } from './power-off-all.action.impl';

/** Registers the power off all action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.power-off-all' })
export class PowerOffAllAction extends PowerOffAllActionImpl {}
