/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { CommandStationInfo } from '@application-platform/domain';
import type { Z21CommandService } from '@application-platform/z21';

type CommandStationInfoRequest = 'firmware' | 'xBusVersion' | 'hwinfo' | 'code';

type RequestState = {
	inFlight: boolean;
	lastSent: number;
};

type RequestStates = Record<CommandStationInfoRequest, RequestState>;

const REQUEST_RETRY_MS = 1000;
/**
 * Orchestrates the retrieval of command station information by managing
 * requests for firmware version, xBus version, hardware info, and code.
 * Ensures that requests are sent in a prioritized manner and handles retries.
 */
export class CommandStationInfoOrchestrator {
	private req: RequestStates = this.createRequestStates();

	constructor(
		private readonly commandStationInfo: CommandStationInfo,
		private readonly z21CommandService: Z21CommandService
	) {}

	/**
	 * Resets pending request state.
	 */
	public reset(): void {
		this.req = this.createRequestStates();
	}

	private createRequestStates(): RequestStates {
		return {
			firmware: {
				inFlight: false,
				lastSent: 0
			},
			xBusVersion: {
				inFlight: false,
				lastSent: 0
			},
			hwinfo: {
				inFlight: false,
				lastSent: 0
			},
			code: {
				inFlight: false,
				lastSent: 0
			}
		};
	}

	/**
	 * Initiates requests for command station information as needed.
	 * Prioritizes firmware version, then hardware info or xBus version,
	 * and finally code if applicable.
	 */
	public poke(): void {
		const now = Date.now();

		if (this.trySendFirmware(now)) return;

		if (!this.commandStationInfo.hasFirmwareVersion()) return;

		if (this.trySendHwOrXBus(now)) return;

		if (this.commandStationInfo.hasHardwareType()) {
			this.trySendCode(now);
		}
	}

	/**
	 * Marks a command-station information request as completed.
	 *
	 * @param type - Request type to acknowledge.
	 */
	public ack(type: CommandStationInfoRequest): void {
		this.req[type].inFlight = false;
	}

	private shouldSend(request: RequestState, now: number): boolean {
		return !request.inFlight || now - request.lastSent > REQUEST_RETRY_MS;
	}

	private trySendFirmware(now: number): boolean {
		if (!this.commandStationInfo.hasFirmwareVersion() && this.shouldSend(this.req.firmware, now)) {
			this.req.firmware.inFlight = true;
			this.req.firmware.lastSent = now;
			this.z21CommandService.getFirmwareVersion();
			return true;
		}
		return false;
	}

	private trySendHwOrXBus(now: number): boolean {
		if (this.supportsHardwareInfo()) {
			if (!this.commandStationInfo.hasHardwareType() && this.shouldSend(this.req.hwinfo, now)) {
				this.req.hwinfo.inFlight = true;
				this.req.hwinfo.lastSent = now;
				this.z21CommandService.getHardwareInfo();
				return true;
			}
			return false;
		}

		// when hwinfo not supported, ask for xBus version
		if (!this.commandStationInfo.hasXBusVersion() && this.shouldSend(this.req.xBusVersion, now)) {
			this.req.xBusVersion.inFlight = true;
			this.req.xBusVersion.lastSent = now;
			this.z21CommandService.getXBusVersion();
			return true;
		}

		return false;
	}

	private supportsHardwareInfo(): boolean {
		const firmware = this.commandStationInfo.getFirmwareVersion();

		if (!firmware) {
			return false;
		}

		return firmware.major > 1 || (firmware.major === 1 && firmware.minor >= 20);
	}

	private trySendCode(now: number): boolean {
		const hw = this.commandStationInfo.getHardwareType();
		const needsCode = hw === 'z21_START' || hw === 'z21_SMALL';

		if (needsCode && !this.commandStationInfo.hasCode() && this.shouldSend(this.req.code, now)) {
			this.req.code.inFlight = true;
			this.req.code.lastSent = now;
			this.z21CommandService.getCode();
			return true;
		}

		return false;
	}
}
