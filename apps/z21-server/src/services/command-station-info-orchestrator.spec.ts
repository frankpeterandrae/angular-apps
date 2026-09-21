/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import type { CommandStationInfo } from '@application-platform/domain';
import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import type { Z21CommandService } from '@application-platform/z21';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommandStationInfoOrchestrator } from './command-station-info-orchestrator';

describe('CommandStationInfoOrchestrator', () => {
	let orchestrator: CommandStationInfoOrchestrator;
	let commandStationInfo: DeepMocked<CommandStationInfo>;
	let z21CommandService: DeepMocked<Z21CommandService>;

	beforeEach(() => {
		vi.useFakeTimers();

		commandStationInfo = DeepMock<CommandStationInfo>();
		z21CommandService = DeepMock<Z21CommandService>();

		commandStationInfo.hasFirmwareVersion.mockReturnValue(false);
		commandStationInfo.hasHardwareType.mockReturnValue(false);
		commandStationInfo.hasXBusVersion.mockReturnValue(false);
		commandStationInfo.hasCode.mockReturnValue(false);

		orchestrator = new CommandStationInfoOrchestrator(commandStationInfo, z21CommandService);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('requests firmware information first', () => {
		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledOnce();

		expect(z21CommandService.getHardwareInfo).not.toHaveBeenCalled();

		expect(z21CommandService.getXBusVersion).not.toHaveBeenCalled();

		expect(z21CommandService.getCode).not.toHaveBeenCalled();
	});

	it('does not resend an in-flight request before the retry timeout', () => {
		orchestrator.poke();
		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledOnce();
	});

	it('retries an in-flight request after the retry timeout', () => {
		orchestrator.poke();

		vi.advanceTimersByTime(1001);

		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledTimes(2);
	});

	it('requests hardware information for firmware 1.20 or newer', () => {
		commandStationInfo.hasFirmwareVersion.mockReturnValue(true);
		commandStationInfo.getFirmwareVersion.mockReturnValue({
			major: 1,
			minor: 20
		});

		orchestrator.poke();

		expect(z21CommandService.getHardwareInfo).toHaveBeenCalledOnce();

		expect(z21CommandService.getXBusVersion).not.toHaveBeenCalled();
	});

	it('requests hardware information for firmware major versions above 1', () => {
		commandStationInfo.hasFirmwareVersion.mockReturnValue(true);
		commandStationInfo.getFirmwareVersion.mockReturnValue({
			major: 2,
			minor: 0
		});

		orchestrator.poke();

		expect(z21CommandService.getHardwareInfo).toHaveBeenCalledOnce();
	});

	it('requests the X-Bus version for firmware older than 1.20', () => {
		commandStationInfo.hasFirmwareVersion.mockReturnValue(true);
		commandStationInfo.getFirmwareVersion.mockReturnValue({
			major: 1,
			minor: 19
		});

		orchestrator.poke();

		expect(z21CommandService.getXBusVersion).toHaveBeenCalledOnce();

		expect(z21CommandService.getHardwareInfo).not.toHaveBeenCalled();
	});

	it.each(['z21_START', 'z21_SMALL'] as const)('requests the command station code for %s', (hardwareType) => {
		commandStationInfo.hasFirmwareVersion.mockReturnValue(true);
		commandStationInfo.getFirmwareVersion.mockReturnValue({
			major: 1,
			minor: 20
		});
		commandStationInfo.hasHardwareType.mockReturnValue(true);
		commandStationInfo.getHardwareType.mockReturnValue(hardwareType);

		orchestrator.poke();

		expect(z21CommandService.getCode).toHaveBeenCalledOnce();
	});

	it('does not request the command station code for hardware that does not require it', () => {
		commandStationInfo.hasFirmwareVersion.mockReturnValue(true);
		commandStationInfo.getFirmwareVersion.mockReturnValue({
			major: 1,
			minor: 20
		});
		commandStationInfo.hasHardwareType.mockReturnValue(true);
		commandStationInfo.getHardwareType.mockReturnValue('Z21_XL');

		orchestrator.poke();

		expect(z21CommandService.getCode).not.toHaveBeenCalled();
	});

	it('allows an acknowledged request to be sent again', () => {
		orchestrator.poke();
		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledOnce();

		orchestrator.ack('firmware');
		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledTimes(2);
	});

	it('resets pending request state', () => {
		orchestrator.poke();

		orchestrator.reset();
		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledTimes(2);
	});

	it('sequences firmware, hardware info and code requests', () => {
		orchestrator.poke();

		expect(z21CommandService.getFirmwareVersion).toHaveBeenCalledOnce();

		commandStationInfo.hasFirmwareVersion.mockReturnValue(true);
		commandStationInfo.getFirmwareVersion.mockReturnValue({
			major: 1,
			minor: 20
		});

		orchestrator.ack('firmware');
		orchestrator.poke();

		expect(z21CommandService.getHardwareInfo).toHaveBeenCalledOnce();

		commandStationInfo.hasHardwareType.mockReturnValue(true);
		commandStationInfo.getHardwareType.mockReturnValue('z21_START');

		orchestrator.ack('hwinfo');
		orchestrator.poke();

		expect(z21CommandService.getCode).toHaveBeenCalledOnce();
	});

	it('does not continue the sequence until firmware information is available', () => {
		orchestrator.poke();

		orchestrator.ack('firmware');
		orchestrator.poke();

		expect(z21CommandService.getHardwareInfo).not.toHaveBeenCalled();

		expect(z21CommandService.getXBusVersion).not.toHaveBeenCalled();

		expect(z21CommandService.getCode).not.toHaveBeenCalled();
	});
});
