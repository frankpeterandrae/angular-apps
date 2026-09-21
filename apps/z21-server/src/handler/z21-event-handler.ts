/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { TrackStatusManager, type CommandStationInfo, type LocoManager } from '@application-platform/domain';
import type { ServerToClient } from '@application-platform/protocol';
import type {
	SystemStateDecoder,
	Z21Codec,
	Z21Dataset,
	Z21DatasetEventMapper,
	Z21UdpDatagram,
	Z21UdpFrom
} from '@application-platform/z21';
import {
	Z21EventName,
	type HardwareType,
	type LocoInfoEventPayload,
	type Logger,
	type PowerPayload,
	type Z21CodeEvent,
	type Z21Event,
	type Z21FirmwareVersionEvent,
	type Z21HwinfoEvent,
	type Z21StoppedEvent,
	type Z21VersionEvent
} from '@application-platform/z21-shared';

import type { CommandStationInfoOrchestrator } from '../services/command-station-info-orchestrator';
import type { CvProgrammingService } from '../services/cv-programming-service';

export type BroadcastFn = (msg: ServerToClient) => void;

/**
 * Processes decoded Z21 protocol data, updates application state,
 * and forwards resulting messages to connected clients.
 */
export class Z21EventHandler {
	private readonly trackStatusManager: TrackStatusManager;

	constructor(
		private readonly broadcast: BroadcastFn,
		private readonly locoManager: LocoManager,
		private readonly logger: Logger,
		private readonly commandStationInfo: CommandStationInfo,
		private readonly csInfoOrchestrator: CommandStationInfoOrchestrator,
		private readonly cvProgrammingService: CvProgrammingService,
		private readonly codec: Z21Codec,
		private readonly datasetEventMapper: Z21DatasetEventMapper,
		private readonly systemStateDecoder: SystemStateDecoder
	) {
		this.trackStatusManager = new TrackStatusManager();
	}

	/**
	 * Processes a datagram received from the Z21 transport.
	 *
	 * @param datagram - Received UDP datagram.
	 */
	public handleDatagram(datagram: Z21UdpDatagram): void {
		const datasets = this.codec.parseZ21Datagram(datagram.raw);

		this.processParsedDatagram(datasets, datagram);
	}

	/**
	 * Handles the bulk of the datagram processing. Split out to lower cognitive complexity of handleDatagram.
	 */
	private processParsedDatagram(datasets: Z21Dataset[], datagram: Z21UdpDatagram): void {
		const { raw, rawHex, from } = datagram;

		const len = raw.readUInt16LE(0);
		const header = raw.readUInt16LE(2);

		for (const dataset of datasets) {
			this.logger.debug('z21.dataset', { ds: dataset });

			this.logDatasetIssues(dataset, from, rawHex);
		}

		const events = datasets
			.filter((dataset) => dataset.kind !== 'ds.unknown' && dataset.kind !== 'ds.bad_xor')
			.flatMap((dataset) => this.datasetEventMapper.map(dataset));

		this.forwardCvEvents(events);

		for (const event of events) {
			this.handleEvent(event, datagram);
		}

		this.logger.info('system.message.z21.rx', {
			from: datagram.from,
			len: datagram.raw.length,
			header,
			frameLen: len,
			datasetKinds: datasets.map((dataset) => dataset.kind),
			eventTypes: events.map((event) => event.event)
		});

		this.logger.debug('z21.rx.raw', {
			from: datagram.from,
			hex: datagram.rawHex
		});
	}

	/**
	 * Logs unknown/bad datasets found in a parsed datagram.
	 */
	private logDatasetIssues(ds: Z21Dataset, from: Z21UdpFrom, rawHex: string): void {
		if (ds.kind === 'ds.unknown') {
			this.logUnknown('frame', 'unknown', {
				from,
				header: ds.header,
				reason: ds.reason,
				payload: Array.from(ds.payload),
				hex: rawHex
			});
		}

		if (ds.kind === 'ds.bad_xor') {
			this.logUnknown('frame', 'bad_xor', { from, calc: ds.calc, recv: ds.recv, hex: rawHex });
		}
	}

	/**
	 * Forward CV-related events to the CV programming service so it can resolve any waiting promises.
	 */
	private forwardCvEvents(events: readonly Z21Event[]): void {
		for (const event of events) {
			if (event.event === Z21EventName.CV_RESULT || event.event === Z21EventName.CV_NACK) {
				this.cvProgrammingService.onEvent(event);
			}
		}
	}

	/**
	 * Central switch to handle individual events. Kept small by delegating to helpers.
	 */
	private handleEvent(event: Z21Event, datagram: Z21UdpDatagram): void {
		switch (event.event) {
			case Z21EventName.SYSTEM_STATE:
				this.handleSystemState(event);
				return;

			case Z21EventName.LOCO_INFO:
				this.updateLocoInfoFromZ21(event.payload);
				return;

			case Z21EventName.TURNOUT_INFO:
				this.broadcast({
					type: 'switching.message.turnout.state',
					payload: {
						addr: event.payload.addr,
						state: event.payload.state
					}
				});
				return;

			case Z21EventName.TRACK_POWER:
			case Z21EventName.STATUS:
				this.updateTrackPower(event.payload, 'ds.lan.x');
				return;

			case Z21EventName.X_BUS_VERSION:
				this.handleXBusVersion(event);
				return;

			case Z21EventName.FIRMWARE_VERSION:
				this.handleFirmwareVersion(event);
				return;

			case Z21EventName.STOPPED:
				this.handleStopped(event);
				return;

			case Z21EventName.Z21_HWINFO:
				this.handleHwInfo(event);
				return;

			case Z21EventName.Z21_CODE:
				this.handleCode(event);
				return;

			case Z21EventName.CV_RESULT:
			case Z21EventName.CV_NACK:
				return;

			case Z21EventName.BROADCAST_FLAGS:
				return;

			case Z21EventName.UNKNOWN_LAN_X:
				this.logUnknown('lan_x', event.event, {
					from: datagram.from,
					hex: datagram.rawHex
				});
				return;

			case Z21EventName.UNKNOWN_X_BUS:
				this.logUnknown('x_bus', event.event, {
					from: datagram.from,
					hex: datagram.rawHex,
					xHeader: event.payload.xHeader,
					bytes: event.payload.bytes
				});
				return;

			case Z21EventName.SERIAL:
				this.broadcast({
					type: 'system.message.z21.rx',
					payload: {
						rawHex: datagram.rawHex,
						datasets: [
							{
								kind: 'ds.serial',
								serial: event.payload.serial,
								from: datagram.from
							}
						],
						events: [event]
					}
				});
				return;
		}
	}

	private handleXBusVersion(event: Z21VersionEvent): void {
		this.logger.info('z21.x.bus.version', event);

		this.commandStationInfo.setXBusVersion(event.payload);
		if (event.payload.cmdsId === 0x12 || event.payload.cmdsId === 0x13) {
			const hardwareType: HardwareType = event.payload.cmdsId === 0x12 ? 'Z21_OLD' : 'z21_START';
			this.commandStationInfo.setHardwareType(hardwareType);
			this.broadcast({ type: 'system.message.hardware.info', payload: { hardwareType } });
		}
		this.broadcast({
			type: 'system.message.x.bus.version',
			payload: { version: event.payload.xBusVersionString, cmdsId: event.payload.cmdsId }
		});
		this.csInfoOrchestrator.ack('xBusVersion');
		this.csInfoOrchestrator.poke();
	}

	private handleFirmwareVersion(event: Z21FirmwareVersionEvent): void {
		this.logger.info('z21.firmware.version', event);
		this.commandStationInfo.setFirmwareVersion(event.payload);
		this.broadcast({ type: 'system.message.firmware.version', payload: { major: event.payload.major, minor: event.payload.minor } });
		this.csInfoOrchestrator.ack('firmware');
		this.csInfoOrchestrator.poke();
	}

	private handleStopped(event: Z21StoppedEvent): void {
		this.logger.info('z21.stopped', event);
		this.trackStatusManager.setEmergencyStop(true, 'ds.lan.x');
		this.broadcast({ type: 'system.message.stop', payload: {} });
	}

	private handleHwInfo(event: Z21HwinfoEvent): void {
		this.logger.info('z21.hwinfo', event);
		this.commandStationInfo.setFirmwareVersion({ major: event.payload.majorVersion, minor: event.payload.minorVersion });
		this.commandStationInfo.setHardwareType(event.payload.hardwareType);
		this.broadcast({
			type: 'system.message.firmware.version',
			payload: { major: event.payload.majorVersion, minor: event.payload.minorVersion }
		});
		this.broadcast({ type: 'system.message.hardware.info', payload: { hardwareType: event.payload.hardwareType } });
		this.csInfoOrchestrator.ack('hwinfo');
		this.csInfoOrchestrator.poke();
	}

	private handleCode(event: Z21CodeEvent): void {
		this.logger.info('z21.code', event);
		this.commandStationInfo.setCode(event.payload.code);
		this.broadcast({ type: 'system.message.z21.code', payload: { code: event.payload.code } });
		this.csInfoOrchestrator.ack('code');
	}

	private logUnknown(
		scope: 'frame' | 'lan_x' | 'x_bus',
		unknownKind: string,
		meta: Record<string, unknown> & { from: { address: string; port: number }; hex?: string }
	): void {
		this.logger.warn('z21.unknown', { scope, unknownKind, ...meta });
	}

	private updateTrackPower(payload: PowerPayload, source: 'ds.x.bus' | 'ds.system.state' | 'ds.lan.x'): void {
		const status = this.trackStatusManager.updateStatus(payload, source);
		this.broadcast({
			type: 'system.message.trackpower',
			payload: status
		});
	}

	private updateLocoInfoFromZ21(locoInfo: LocoInfoEventPayload): void {
		const locoState = this.locoManager.updateLocoInfoFromZ21(locoInfo);
		this.broadcast({
			type: 'loco.message.state',
			payload: {
				addr: locoState.addr,
				speed: locoState.state.speed,
				dir: locoState.state.dir,
				fns: locoState.state.fns,
				estop: locoState.state.estop
			}
		});
	}

	private handleSystemState(
		event: Extract<
			Z21Event,
			{
				event: typeof Z21EventName.SYSTEM_STATE;
			}
		>
	): void {
		const flags = this.systemStateDecoder.deriveTrackFlags({
			centralState: event.payload.centralState,
			centralStateEx: event.payload.centralStateEx
		});

		this.updateTrackPower(
			{
				powerOn: Boolean(flags.powerOn),
				emergencyStop: Boolean(flags.emergencyStop),
				shortCircuit: Boolean(flags.shortCircuit),
				programmingMode: Boolean(flags.programmingMode)
			},
			'ds.system.state'
		);
	}
}
