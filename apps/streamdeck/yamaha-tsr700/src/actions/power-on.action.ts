import { action } from '@elgato/streamdeck';

import { PowerOnActionImpl } from './power-on.action.impl';

/** Registers the power on action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.power-on' })
export class PowerOnAction extends PowerOnActionImpl {}
