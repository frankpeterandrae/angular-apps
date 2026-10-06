import { EventEmitter } from 'node:events';

import streamDeck from '@elgato/streamdeck';

import type { ZoneStatus } from '../models';
import type { Zone } from '../types';
import type { YamahaClient } from '../yamaha-client';

import type { FeaturesService } from './features.service';

type YamahaStatusClient = Pick<YamahaClient, 'getBasicStatus'>;
type YamahaFeaturesClient = Pick<FeaturesService, 'getZones'>;

/** Polls zone status without overlapping requests and emits changes to subscribed actions. */
export class StatusService {
	private readonly events = new EventEmitter();

	private timer?: ReturnType<typeof setInterval>;

	// A receiver change invalidates responses from requests started for the previous address.
	private generation = 0;
	private running = false;
	private refreshPromise?: Promise<void>;
	private readonly status = new Map<Zone, ZoneStatus>();

	constructor(
		private readonly yamaha: YamahaStatusClient,
		private readonly features: YamahaFeaturesClient,
		private readonly pollInterval = 1000
	) {}

	/** Starts one polling interval and performs an initial refresh; failures are logged and retried on later ticks. */
	public async start(): Promise<void> {
		if (this.running) return;
		this.running = true;
		this.timer = setInterval(() => {
			void this.refreshSafely();
		}, this.pollInterval);
		await this.refreshSafely();
	}

	private async refreshSafely(): Promise<void> {
		try {
			await this.refresh();
		} catch (error) {
			streamDeck.logger.warn(`Could not refresh Yamaha status. ${String(error)}`);
		}
	}

	/** Stops future polling ticks; a refresh already in flight may still complete. */
	public stop(): void {
		this.running = false;
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	/** Refreshes every zone, sharing an in-flight request and rejecting when a zone fails. */
	public refresh(): Promise<void> {
		this.refreshPromise ??= this.refreshAllZones().finally(() => {
			this.refreshPromise = undefined;
		});
		return this.refreshPromise;
	}

	/** Clears receiver-specific status and refreshes after any previous request settles. */
	public async reset(): Promise<void> {
		this.generation++;
		this.status.clear();
		await this.refreshPromise?.catch(() => undefined);
		await this.refresh();
	}

	private async refreshAllZones(): Promise<void> {
		const generation = this.generation;
		const zones = await this.features.getZones();
		if (generation !== this.generation) return;
		const results = await Promise.allSettled(zones.map((zone) => this.refreshZone(zone.id, generation)));
		const failed = results.find((result) => result.status === 'rejected');
		if (failed?.status === 'rejected') throw failed.reason;
	}

	/** Returns the most recently loaded status for a zone, or undefined before its first successful refresh. */
	public getStatus(zone: Zone): ZoneStatus | undefined {
		return this.status.get(zone);
	}

	/** Subscribes to first status loads and changes in the fields represented by ZoneStatus. */
	public onStatusChanged(listener: (zone: Zone, status: ZoneStatus) => void): void {
		this.events.on('statusChanged', listener);
	}

	/** Removes a previously registered status listener. */
	public offStatusChanged(listener: (zone: Zone, status: ZoneStatus) => void): void {
		this.events.off('statusChanged', listener);
	}

	private async refreshZone(zone: Zone, generation: number): Promise<void> {
		const newStatus = await this.yamaha.getBasicStatus(zone);
		if (generation !== this.generation) return;
		const previousStatus = this.status.get(zone);

		this.status.set(zone, newStatus);

		if (this.hasStatusChanged(previousStatus, newStatus)) {
			this.events.emit('statusChanged', zone, newStatus);
		}
	}

	private hasStatusChanged(previousStatus: ZoneStatus | undefined, newStatus: ZoneStatus): boolean {
		if (!previousStatus) {
			return true;
		}

		return (
			previousStatus.power !== newStatus.power ||
			previousStatus.mute !== newStatus.mute ||
			previousStatus.volume !== newStatus.volume ||
			previousStatus.maxVolume !== newStatus.maxVolume ||
			previousStatus.actualVolume !== newStatus.actualVolume ||
			previousStatus.input !== newStatus.input ||
			previousStatus.inputText !== newStatus.inputText
		);
	}
}
