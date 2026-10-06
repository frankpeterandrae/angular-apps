import { beforeEach, describe, expect, it, vi } from 'vitest';

const streamDeckMocks = vi.hoisted(() => ({
	getGlobalSettings: vi.fn()
}));

vi.mock('@elgato/streamdeck', () => ({
	default: {
		settings: {
			getGlobalSettings: streamDeckMocks.getGlobalSettings
		}
	}
}));

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
	let service: SettingsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new SettingsService();
	});

	it('detects only effective receiver changes', () => {
		expect(service.hasReceiverChanged({})).toBe(false);
		expect(service.hasReceiverChanged({ receiverAddress: 'receiver-b' })).toBe(true);
		expect(service.hasReceiverChanged({ receiverAddress: ' receiver-b ' })).toBe(false);
		expect(service.hasReceiverChanged({})).toBe(true);
	});

	it('reads global settings', async () => {
		streamDeckMocks.getGlobalSettings.mockResolvedValue({
			receiverAddress: '192.168.178.67'
		});

		await service.getReceiverAddress();

		expect(streamDeckMocks.getGlobalSettings).toHaveBeenCalledOnce();
	});

	it.each([
		['configured', '192.168.178.67', '192.168.178.67'],
		['trimmed', ' 192.168.178.67 ', '192.168.178.67'],
		['missing', undefined, '192.168.178.67'],
		['blank', '   ', '192.168.178.67']
	])('resolves the %s receiver address', async (_case, receiverAddress, expected) => {
		streamDeckMocks.getGlobalSettings.mockResolvedValue({ receiverAddress });
		await expect(service.getReceiverAddress()).resolves.toBe(expected);
	});
});
