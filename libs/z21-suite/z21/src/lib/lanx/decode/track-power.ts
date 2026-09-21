/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Z21EventName, type TrackPowerCommand, type TrackPowerEvent } from '@application-platform/z21-shared';

/**
 * Decodes LAN-X track power commands.
 */
export class LanXTrackPowerDecoder {
	/**
	 * Converts a track power command into its corresponding state event.
	 *
	 * @param command - LAN-X command.
	 * @returns Track power event, or no event for unsupported commands.
	 */
	public decode(command: TrackPowerCommand): TrackPowerEvent[] {
		const state = this.getState(command);

		return [
			{
				event: Z21EventName.TRACK_POWER,
				payload: {
					...state,
					raw: Array.from(Buffer.from(command, 'ascii'))
				}
			}
		];
	}

	private getState(command: TrackPowerCommand): Omit<TrackPowerEvent['payload'], 'raw'> {
		switch (command) {
			case 'LAN_X_BC_TRACK_POWER_OFF':
				return {
					emergencyStop: false,
					powerOn: false,
					programmingMode: false,
					shortCircuit: false
				};

			case 'LAN_X_BC_TRACK_POWER_ON':
				return {
					emergencyStop: false,
					powerOn: true,
					programmingMode: false,
					shortCircuit: false
				};

			case 'LAN_X_BC_PROGRAMMING_MODE':
				return {
					emergencyStop: false,
					powerOn: true,
					programmingMode: true,
					shortCircuit: false
				};

			case 'LAN_X_BC_TRACK_SHORT_CIRCUIT':
				return {
					emergencyStop: false,
					powerOn: false,
					programmingMode: false,
					shortCircuit: true
				};
		}
	}
}
