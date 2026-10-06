import { action } from '@elgato/streamdeck';

import { SceneActionImpl } from './scene.action.impl';

/** Registers the scene action under its manifest UUID. */
@action({ UUID: 'de.frankpeterandrae.yamaha.scene' })
export class SceneAction extends SceneActionImpl {}
