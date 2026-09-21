/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */
import type { Direction, Logger } from '@application-platform/z21-shared';

import type { LocoFunctionSwitchType, Z21BroadcastFlag } from '../constants';
import type { LocoEncoder, ProgrammingEncoder, SystemEncoder, TurnoutEncoder } from '../lanx/encoder';
import { type Z21Udp } from '../udp/udp';

export type TurnoutOptions = {
	queue?: boolean;
	pulseMs?: number;
};

/**
 * Coordinates Z21 command encoding, logging and UDP transmission.
 */
export class Z21CommandService {
	private readonly turnoutOffTimers = new Map<number, NodeJS.Timeout>();
	/**
	 * Creates an instance of Z21CommandService.
	 * @param udp - The UDP transport service for communicating with Z21.
	 * @param logger - Logger instance for logging messages.
	 * @param locoEncoder - Encoder for locomotive commands (speed, functions, etc.)
	 * @param programmingEncoder - Encoder for programming commands (CV read/write, etc.)
	 * @param systemEncoder - Encoder for system commands (status, version, etc.)
	 * @param turnoutEncoder - Encoder for turnout commands (set position, info, etc.)
	 */
	constructor(
		private readonly udp: Z21Udp,
		private readonly logger: Logger,
		private readonly locoEncoder: LocoEncoder,
		private readonly programmingEncoder: ProgrammingEncoder,
		private readonly systemEncoder: SystemEncoder,
		private readonly turnoutEncoder: TurnoutEncoder
	) {}

	/**
	 * Sends a track power command to the Z21 device.
	 * @param on - Whether to enable (true) or disable (false) track power.
	 */
	public sendTrackPower(on: boolean): void {
		const buf = on ? this.systemEncoder.trackPowerOn() : this.systemEncoder.trackPowerOff();
		this.logger.debug('[z21] tx TRACK_POWER', { powerOn: on ? 'ON' : 'OFF', hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Sends a locomotive drive command.
	 *
	 * @param address - Locomotive address.
	 * @param speedStep - Regular 128-mode speed step from 0 to 126.
	 * @param direction - Direction of travel.
	 */
	public setLocoDrive(address: number, speedStep: number, direction: Direction): void {
		const buffer = this.locoEncoder.drive(address, speedStep, direction);

		this.logger.debug('[z21] tx LOCO_DRIVE', {
			address,
			speedStep,
			direction,
			hex: buffer.toString('hex')
		});

		this.udp.sendRaw(buffer);
	}

	/**
	 * Set or toggle a locomotive function (F0..Fn).
	 *
	 * Encodes a LAN/X frame that contains an X-BUS LOCO_FUNCTION command and sends it.
	 * Logs the encoded frame hex for debugging.
	 *
	 * @param address - Locomotive address to apply the function change.
	 * @param fn - Function index (e.g. 0..31 depending on loco capability).
	 * @param on - One of the LocoFunctionSwitchType values (Off, On, Toggle).
	 */
	public setLocoFunction(address: number, fn: number, on: LocoFunctionSwitchType): void {
		const buf = this.locoEncoder.setFunction(address, fn, on);
		this.logger.debug('[z21] tx LOCO_FUNCTION', { address, fn, on, hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Requests the current locomotive state from the Z21.
	 *
	 * @param address - Locomotive address to query.
	 */
	public getLocoInfo(address: number): void {
		const buf = this.locoEncoder.getInfo(address);
		this.logger.debug('[z21] tx LOCO_INFO', { address, hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Request turnout information from the Z21.
	 *
	 * Encodes the LAN/X TURNOUT_INFO command and sends it to the central.
	 * @param address - Address of the turnout to query.
	 */
	public getTurnoutInfo(address: number): void {
		const buf = this.turnoutEncoder.getInfo(address);
		this.logger.debug('[z21] tx TURNOUT_INFO', { address, hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Sets a turnout to a specified position with optional queuing and pulse duration.
	 * Sends an activation command followed by a deactivation command after the pulse duration.
	 * @param address - Turnout address
	 * @param port - Port (0 or 1) to set the turnout position
	 * @param options - Optional settings:
	 *  - queue: Whether to queue the command (default: true)
	 *   - pulseMs: Duration in milliseconds before deactivating the turnout (default: 100ms)
	 */
	public setTurnout(address: number, port: 0 | 1, options?: TurnoutOptions): void {
		const queueFlag = options?.queue ?? true;
		const pulseMs = options?.pulseMs ?? 100;

		const existingTimer = this.turnoutOffTimers.get(address);
		if (existingTimer) {
			clearTimeout(existingTimer);
			this.turnoutOffTimers.delete(address);
		}

		const buf = this.turnoutEncoder.set(address, port, true, queueFlag);
		this.logger.debug('[z21] tx TURNOUT_SET', { address, port, A: 1, queue: queueFlag, hex: buf.toString('hex') });
		this.udp.sendRaw(buf);

		const timer = setTimeout(() => {
			if (!this.turnoutOffTimers.has(address) || this.turnoutOffTimers.get(address) !== timer) {
				return;
			}

			this.turnoutOffTimers.delete(address);

			const bufOff = this.turnoutEncoder.set(address, port, false, queueFlag);
			this.logger.debug('[z21] tx TURNOUT_SET', {
				address,
				port,
				A: 0,
				queue: queueFlag,
				hex: bufOff.toString('hex')
			});
			this.udp.sendRaw(bufOff);
		}, pulseMs);

		this.turnoutOffTimers.set(address, timer);
	}

	/**
	 * Sends an emergency stop command for a locomotive to the Z21 device.
	 *
	 * @param address - Locomotive address to emergency stop.
	 */
	public setLocoEStop(address: number): void {
		const buffer = this.locoEncoder.emergencyStop(address);

		this.logger.debug('[z21] tx LOCO_ESTOP', {
			address,
			hex: buffer.toString('hex')
		});

		this.udp.sendRaw(buffer);
	}

	/**
	 * Requests the Z21 firmware version information.
	 */
	public getXBusVersion(): void {
		const buf = this.systemEncoder.getVersion();
		this.logger.debug('[z21] tx GET_VERSION', { hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Requests the Z21 status information.
	 */
	public getStatus(): void {
		const buf = this.systemEncoder.getStatus();
		this.logger.debug('[z21] tx GET_STATUS', { hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Sends a global emergency stop command to the Z21 device.
	 */
	public setStop(): void {
		const buf = this.systemEncoder.stop();
		this.logger.debug('[z21] tx SET_STOP', { hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Requests the Z21 firmware version information.
	 */
	public getFirmwareVersion(): void {
		const buf = this.systemEncoder.getFirmwareVersion();
		this.logger.debug('[z21] tx GET_FIRMWARE_VERSION', { hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Requests the Z21 hardware information.
	 */
	public getHardwareInfo(): void {
		const buffer = this.systemEncoder.getHardwareInfo();

		this.logger.debug('[z21] tx GET_HARDWARE_INFO', { hex: buffer.toString('hex') });

		this.udp.sendRaw(buffer);
	}

	/**
	 * Requests the Z21 command station code information.
	 */
	public getCode(): void {
		const buffer = this.systemEncoder.getCode();

		this.logger.debug('[z21] tx LAN_GET_CODE', { hex: buffer.toString('hex') });

		this.udp.sendRaw(buffer);
	}

	/**
	 * Sends a CV read command to the Z21.
	 * @param cvAddress - CV address to read (1-1024)
	 */
	public sendCvRead(cvAddress: number): void {
		const buf = this.programmingEncoder.readCv(cvAddress);
		this.logger.debug('[z21] tx CV_READ', { cvAddress, hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 * Sends a CV write command to the Z21.
	 * @param cvAddress - CV address to write (1-1024)
	 * @param cvValue - CV value to write (0-255)
	 */
	public sendCvWrite(cvAddress: number, cvValue: number): void {
		const buf = this.programmingEncoder.writeCv(cvAddress, cvValue);
		this.logger.debug('[z21] tx CV_WRITE', { cvAddress, cvValue, hex: buf.toString('hex') });
		this.udp.sendRaw(buf);
	}

	/**
	 *  Requests the Z21 broadcast flags information.
	 */
	public getBroadcastFlags(): void {
		const buffer = this.systemEncoder.getBroadcastFlags();

		this.logger.debug('[z21] tx LAN_GET_BROADCASTFLAGS', { hex: buffer.toString('hex') });

		this.udp.sendRaw(buffer);
	}

	/**
	 * Sets the Z21 broadcast flags.
	 *
	 * @param flags - Broadcast flags to set (bitmask of Z21BroadcastFlag values)
	 */
	public setBroadcastFlags(flags: Z21BroadcastFlag): void {
		const buffer = this.systemEncoder.setBroadcastFlags(flags);

		this.udp.sendRaw(buffer);
	}

	/**
	 * Requests the Z21 system state information.
	 */
	public getSystemState(): void {
		const buffer = this.systemEncoder.getSystemState();

		this.udp.sendRaw(buffer);
	}

	/**
	 * Sends a log-off command to the Z21 device.
	 */
	public logOff(): void {
		const buffer = this.systemEncoder.logOff();

		this.udp.sendRaw(buffer);
	}
}
