import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ZoneOption, ZoneStatus } from '../models';
import type { YamahaClient } from '../yamaha-client';

import type { FeaturesService } from './features.service';
import { StatusService } from './status.service';

describe('StatusService', () => {
	let yamaha: Pick<YamahaClient, 'getBasicStatus'>;
	let service: StatusService;
	let features: Pick<FeaturesService, 'getZones'>;

	beforeEach(() => {
		vi.useFakeTimers();

		yamaha = {
			getBasicStatus: vi.fn(async (): Promise<ZoneStatus> => ({ power: 'On' }))
		} satisfies Pick<YamahaClient, 'getBasicStatus'>;

		features = {
			getZones: vi.fn(async (): Promise<ZoneOption[]> => [
				{ id: 'main', label: 'Main Zone' },
				{ id: 'zone2', label: 'Zone 2' }
			])
		} satisfies Pick<FeaturesService, 'getZones'>;

		service = new StatusService(yamaha, features, 1000);
	});

	afterEach(() => {
		service.stop();
		vi.useRealTimers();
	});

	it('discards old receiver status when resetting during a request', async () => {
		let finish!: (status: ZoneStatus) => void;
		vi.mocked(features.getZones).mockResolvedValue([{ id: 'main', label: 'Main' }]);
		vi.mocked(yamaha.getBasicStatus)
			.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						finish = resolve;
					})
			)
			.mockResolvedValue({ power: 'Standby' });
		const request = service.refresh();
		await vi.waitFor(() => expect(yamaha.getBasicStatus).toHaveBeenCalledOnce());
		const reset = service.reset();
		finish({ power: 'On' });
		await Promise.all([request, reset]);
		expect(service.getStatus('main')).toEqual({ power: 'Standby' });
	});

	it('starts polling only once', async () => {
		await Promise.all([service.start(), service.start()]);
		vi.clearAllMocks();
		await vi.advanceTimersByTimeAsync(1000);
		expect(features.getZones).toHaveBeenCalledOnce();
	});

	it('recovers when the initial refresh fails', async () => {
		vi.mocked(features.getZones).mockRejectedValueOnce(new Error('offline'));
		await service.start();
		await vi.advanceTimersByTimeAsync(1000);
		expect(service.getStatus('main')).toEqual({ power: 'On' });
	});

	it('shares an in-flight refresh rather than overlapping requests', async () => {
		let finish!: (zones: ZoneOption[]) => void;
		vi.mocked(features.getZones).mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				})
		);
		const first = service.refresh();
		const second = service.refresh();
		expect(features.getZones).toHaveBeenCalledOnce();
		finish([{ id: 'main', label: 'Main' }]);
		await Promise.all([first, second]);
		expect(yamaha.getBasicStatus).toHaveBeenCalledOnce();
	});

	it('loads all zones on start', async () => {
		await service.start();

		expect(features.getZones).toHaveBeenCalledOnce();

		expect(yamaha.getBasicStatus).toHaveBeenCalledTimes(2);
		expect(yamaha.getBasicStatus).toHaveBeenCalledWith('main');
		expect(yamaha.getBasicStatus).toHaveBeenCalledWith('zone2');

		expect(service.getStatus('main')).toEqual({ power: 'On' });
		expect(service.getStatus('zone2')).toEqual({ power: 'On' });
	});

	it('polls every second', async () => {
		await service.start();

		vi.clearAllMocks();

		await vi.advanceTimersByTimeAsync(1000);

		expect(features.getZones).toHaveBeenCalledOnce();
		expect(yamaha.getBasicStatus).toHaveBeenCalledTimes(2);
		expect(yamaha.getBasicStatus).toHaveBeenCalledWith('main');
		expect(yamaha.getBasicStatus).toHaveBeenCalledWith('zone2');
	});

	it('refresh updates immediately', async () => {
		await service.refresh();

		expect(features.getZones).toHaveBeenCalledOnce();
		expect(yamaha.getBasicStatus).toHaveBeenCalledTimes(2);
		expect(yamaha.getBasicStatus).toHaveBeenCalledWith('main');
		expect(yamaha.getBasicStatus).toHaveBeenCalledWith('zone2');
	});

	it('stops polling', async () => {
		await service.start();

		vi.clearAllMocks();

		service.stop();

		await vi.advanceTimersByTimeAsync(5000);

		expect(features.getZones).not.toHaveBeenCalled();
		expect(yamaha.getBasicStatus).not.toHaveBeenCalled();
	});

	it('notifies listeners on first status load', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({ power: 'On', mute: false })
			.mockResolvedValueOnce({ power: 'Standby', mute: true });

		service.onStatusChanged(listener);

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: false
		});
		expect(listener).toHaveBeenCalledWith('zone2', {
			power: 'Standby',
			mute: true
		});
	});

	it('does not notify listeners when status did not change', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({ power: 'On', mute: false })
			.mockResolvedValueOnce({ power: 'Standby', mute: true })
			.mockResolvedValueOnce({ power: 'On', mute: false })
			.mockResolvedValueOnce({ power: 'Standby', mute: true });

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).not.toHaveBeenCalled();
	});

	it('notifies listeners when power changes', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({ power: 'Standby', mute: false })
			.mockResolvedValueOnce({ power: 'Standby', mute: false })
			.mockResolvedValueOnce({ power: 'On', mute: false })
			.mockResolvedValueOnce({ power: 'Standby', mute: false });

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: false
		});
	});

	it('notifies listeners when mute changes from outside', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({ power: 'On', mute: false })
			.mockResolvedValueOnce({ power: 'Standby', mute: false })
			.mockResolvedValueOnce({ power: 'On', mute: true })
			.mockResolvedValueOnce({ power: 'Standby', mute: false });

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: true
		});
	});

	it('notifies listeners when volume changes from outside', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				volume: 90,
				maxVolume: 161,
				actualVolume: -35
			})
			.mockResolvedValueOnce({ power: 'Standby', mute: false })
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				volume: 91,
				maxVolume: 161,
				actualVolume: -34.5
			})
			.mockResolvedValueOnce({ power: 'Standby', mute: false });

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: false,
			volume: 91,
			maxVolume: 161,
			actualVolume: -34.5
		});
	});

	it('notifies listeners when max volume changes', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				volume: 90,
				maxVolume: 161,
				actualVolume: -35
			})
			.mockResolvedValueOnce({ power: 'Standby', mute: false })
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				volume: 90,
				maxVolume: 170,
				actualVolume: -35
			})
			.mockResolvedValueOnce({ power: 'Standby', mute: false });

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: false,
			volume: 90,
			maxVolume: 170,
			actualVolume: -35
		});
	});

	it('notifies listeners when input changes from outside', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				input: 'net_radio',
				inputText: 'NET RADIO'
			})
			.mockResolvedValueOnce({
				power: 'Standby',
				mute: false,
				input: 'audio1',
				inputText: 'Audio 1'
			})
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				input: 'amazon_music',
				inputText: 'Amazon Music'
			})
			.mockResolvedValueOnce({
				power: 'Standby',
				mute: false,
				input: 'audio1',
				inputText: 'Audio 1'
			});

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: false,
			input: 'amazon_music',
			inputText: 'Amazon Music'
		});
	});

	it('notifies listeners when input text changes from outside', async () => {
		const listener = vi.fn();

		vi.mocked(yamaha.getBasicStatus)
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				input: 'hdmi1',
				inputText: 'HDMI1'
			})
			.mockResolvedValueOnce({
				power: 'Standby',
				mute: false,
				input: 'audio1',
				inputText: 'Audio 1'
			})
			.mockResolvedValueOnce({
				power: 'On',
				mute: false,
				input: 'hdmi1',
				inputText: 'Blu-ray'
			})
			.mockResolvedValueOnce({
				power: 'Standby',
				mute: false,
				input: 'audio1',
				inputText: 'Audio 1'
			});

		service.onStatusChanged(listener);

		await service.refresh();

		listener.mockClear();

		await service.refresh();

		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith('main', {
			power: 'On',
			mute: false,
			input: 'hdmi1',
			inputText: 'Blu-ray'
		});
	});

	it('removes listeners', async () => {
		const listener = vi.fn();

		service.onStatusChanged(listener);
		service.offStatusChanged(listener);

		await service.refresh();

		expect(listener).not.toHaveBeenCalled();
	});

	it('can stop when polling was never started', () => {
		expect(() => service.stop()).not.toThrow();
	});
});
