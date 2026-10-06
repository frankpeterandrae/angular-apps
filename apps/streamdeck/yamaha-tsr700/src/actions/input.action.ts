import { action } from '@elgato/streamdeck';

import { InputActionImpl } from './input.action.impl';

/** Registers the input action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.input' })
export class InputAction extends InputActionImpl {}
