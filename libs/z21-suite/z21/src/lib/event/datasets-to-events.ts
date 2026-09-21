/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type Z21Event, Z21EventName } from '@application-platform/z21-shared';

import type { Z21Dataset } from '../codec/codec-types';
import type { LanXDecoder } from '../lanx/decode/decoder';
import type { SystemInfoDecoder } from '../system/system-info-decoder';
import type { SystemStateDecoder } from '../system/system-state-decoder';

/**
 * Maps decoded Z21 datasets to higher-level domain events.
 */
export class Z21DatasetEventMapper {
	constructor(
		private readonly decodeLanXPayload: LanXDecoder,
		private readonly systemInfoDecoder: SystemInfoDecoder,
		private readonly systemStateDecoder: SystemStateDecoder
	) {}
	/**
	 * Converts a decoded Z21 dataset into higher-level domain events.
	 *
	 * Diagnostic datasets such as unknown frames or checksum failures do not
	 * produce events.
	 *
	 * @param dataset - Dataset to convert.
	 * @returns Events derived from the dataset.
	 */
	public map(dataset: Z21Dataset): Z21Event[] {
		switch (dataset.kind) {
			case 'ds.system.state':
				return [
					{
						event: Z21EventName.SYSTEM_STATE,
						payload: {
							...this.systemStateDecoder.decode(dataset.state),
							raw: Array.from(dataset.state)
						}
					}
				];

			case 'ds.x.bus':
				return this.decodeLanXPayload.decode(dataset.xHeader, dataset.data);

			case 'ds.hwinfo':
				return [this.systemInfoDecoder.decodeHardwareInfo(dataset.hwtype, dataset.fwVersionBcd)];

			case 'ds.code':
				return [
					{
						event: Z21EventName.Z21_CODE,
						payload: {
							code: dataset.code,
							raw: [dataset.code]
						}
					}
				];

			case 'ds.broadcast.flags':
				return [this.systemInfoDecoder.decodeBroadcastFlags(dataset.flags)];

			case 'ds.unknown':
			case 'ds.bad_xor':
				return [];
			case 'ds.serial':
				return [
					{
						event: Z21EventName.SERIAL,
						payload: {
							serial: dataset.serial,
							raw: [
								dataset.serial & 0xff,
								(dataset.serial >> 8) & 0xff,
								(dataset.serial >> 16) & 0xff,
								(dataset.serial >> 24) & 0xff
							]
						}
					}
				];
		}
	}
}
