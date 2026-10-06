import { action } from '@elgato/streamdeck';

import { NetUsbMediaControlActionImpl } from './net-usb-media-control.action.impl';

/** Registers the net usb media control action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.net-usb-media-control' })
export class NetUsbMediaControlAction extends NetUsbMediaControlActionImpl {}
