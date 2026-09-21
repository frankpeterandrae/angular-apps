/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { DeepMock, type DeepMocked } from '@application-platform/shared-node-test';
import { Direction, type Logger } from '@application-platform/z21-shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocoFunctionSwitchType } from '../constants';
import type { LocoEncoder, ProgrammingEncoder, SystemEncoder, TurnoutEncoder } from '../lanx/encoder';
import type { Z21Udp } from '../udp/udp';

import { Z21CommandService } from './z21-command-service';

type Services = {
	udp: DeepMocked<Z21Udp>;
	logger: DeepMocked<Logger>;
	locoEncoder: DeepMocked<LocoEncoder>;
	programmingEncoder: DeepMocked<ProgrammingEncoder>;
	systemEncoder: DeepMocked<SystemEncoder>;
	turnoutEncoder: DeepMocked<TurnoutEncoder>;
	service: Z21CommandService;
};

describe('Z21CommandService', () => {
	let services: Services;

	function createServices(): Services {
		const udp = DeepMock<Z21Udp>();
		const logger = DeepMock<Logger>();
		const locoEncoder = DeepMock<LocoEncoder>();
		const programmingEncoder = DeepMock<ProgrammingEncoder>();
		const systemEncoder = DeepMock<SystemEncoder>();
		const turnoutEncoder = DeepMock<TurnoutEncoder>();

		const service = new Z21CommandService(udp, logger, locoEncoder, programmingEncoder, systemEncoder, turnoutEncoder);

		return {
			udp,
			logger,
			locoEncoder,
			programmingEncoder,
			systemEncoder,
			turnoutEncoder,
			service
		};
	}

	function mockBuffer(): Buffer {
		return Buffer.from([0x01, 0x02, 0x03]);
	}

	beforeEach(() => {
		vi.useFakeTimers();
		services = createServices();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('track power', () => {
		it.each([
			{
				on: true,
				method: 'trackPowerOn'
			},
			{
				on: false,
				method: 'trackPowerOff'
			}
		] as const)('uses $method when power is $on', ({ on, method }) => {
			const buffer = mockBuffer();

			services.systemEncoder[method].mockReturnValue(buffer);

			services.service.sendTrackPower(on);

			expect(services.systemEncoder[method]).toHaveBeenCalledOnce();

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});
	});

	describe('locomotive commands', () => {
		it.each([0, 1, 47, 126])('delegates speed step %s to the locomotive encoder', (speedStep) => {
			const buffer = mockBuffer();

			services.locoEncoder.drive.mockReturnValue(buffer);

			services.service.setLocoDrive(3, speedStep, Direction.FWD);

			expect(services.locoEncoder.drive).toHaveBeenCalledWith(3, speedStep, Direction.FWD);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});

		it('delegates locomotive function commands', () => {
			const buffer = mockBuffer();

			services.locoEncoder.setFunction.mockReturnValue(buffer);

			services.service.setLocoFunction(3, 5, LocoFunctionSwitchType.ON);

			expect(services.locoEncoder.setFunction).toHaveBeenCalledWith(3, 5, LocoFunctionSwitchType.ON);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});

		it('delegates locomotive information requests', () => {
			const buffer = mockBuffer();

			services.locoEncoder.getInfo.mockReturnValue(buffer);

			services.service.getLocoInfo(3);

			expect(services.locoEncoder.getInfo).toHaveBeenCalledWith(3);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});

		it('delegates locomotive emergency stop', () => {
			const buffer = mockBuffer();

			services.locoEncoder.emergencyStop.mockReturnValue(buffer);

			services.service.setLocoEStop(3);

			expect(services.locoEncoder.emergencyStop).toHaveBeenCalledWith(3);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});
	});

	describe('turnout commands', () => {
		it('delegates turnout information requests', () => {
			const buffer = mockBuffer();

			services.turnoutEncoder.getInfo.mockReturnValue(buffer);

			services.service.getTurnoutInfo(42);

			expect(services.turnoutEncoder.getInfo).toHaveBeenCalledWith(42);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});

		it('activates and deactivates a turnout after the pulse duration', () => {
			const onBuffer = Buffer.from([0x01]);
			const offBuffer = Buffer.from([0x02]);

			services.turnoutEncoder.set.mockReturnValueOnce(onBuffer).mockReturnValueOnce(offBuffer);

			services.service.setTurnout(42, 1, {
				queue: true,
				pulseMs: 100
			});

			expect(services.turnoutEncoder.set).toHaveBeenNthCalledWith(1, 42, 1, true, true);

			expect(services.udp.sendRaw).toHaveBeenNthCalledWith(1, onBuffer);

			vi.advanceTimersByTime(100);

			expect(services.turnoutEncoder.set).toHaveBeenNthCalledWith(2, 42, 1, false, true);

			expect(services.udp.sendRaw).toHaveBeenNthCalledWith(2, offBuffer);
		});

		it('replaces an existing turnout pulse timer', () => {
			services.turnoutEncoder.set.mockReturnValue(Buffer.alloc(1));

			services.service.setTurnout(42, 0, { pulseMs: 100 });

			vi.advanceTimersByTime(50);

			services.service.setTurnout(42, 1, { pulseMs: 100 });

			vi.advanceTimersByTime(50);

			expect(services.turnoutEncoder.set).toHaveBeenCalledTimes(2);

			vi.advanceTimersByTime(50);

			expect(services.turnoutEncoder.set).toHaveBeenCalledTimes(3);
		});

		it('uses default turnout options', () => {
			services.turnoutEncoder.set.mockReturnValue(Buffer.alloc(1));

			services.service.setTurnout(42, 0);

			expect(services.turnoutEncoder.set).toHaveBeenNthCalledWith(1, 42, 0, true, true);

			vi.advanceTimersByTime(99);

			expect(services.turnoutEncoder.set).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(1);

			expect(services.turnoutEncoder.set).toHaveBeenNthCalledWith(2, 42, 0, false, true);
		});
	});

	describe('programming commands', () => {
		it('delegates CV reads', () => {
			const buffer = mockBuffer();

			services.programmingEncoder.readCv.mockReturnValue(buffer);

			services.service.sendCvRead(29);

			expect(services.programmingEncoder.readCv).toHaveBeenCalledWith(29);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});

		it('delegates CV writes', () => {
			const buffer = mockBuffer();

			services.programmingEncoder.writeCv.mockReturnValue(buffer);

			services.service.sendCvWrite(29, 42);

			expect(services.programmingEncoder.writeCv).toHaveBeenCalledWith(29, 42);

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});
	});

	describe('system commands', () => {
		it.each([
			['getXBusVersion', 'getVersion'],
			['getStatus', 'getStatus'],
			['setStop', 'stop'],
			['getFirmwareVersion', 'getFirmwareVersion'],
			['getHardwareInfo', 'getHardwareInfo'],
			['getCode', 'getCode'],
			['getBroadcastFlags', 'getBroadcastFlags']
		] as const)('%s delegates to SystemEncoder.%s', (serviceMethod, encoderMethod) => {
			const buffer = mockBuffer();

			services.systemEncoder[encoderMethod].mockReturnValue(buffer);

			services.service[serviceMethod]();

			expect(services.systemEncoder[encoderMethod]).toHaveBeenCalledOnce();

			expect(services.udp.sendRaw).toHaveBeenCalledWith(buffer);
		});
	});
});
