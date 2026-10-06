import streamDeck from '@elgato/streamdeck';
import type { JsonObject } from '@elgato/utils';

export interface YamahaGlobalSettings extends JsonObject {
	receiverAddress?: string;
}

/** Reads the receiver address and detects effective address changes from global settings. */
export class SettingsService {
	// Local receiver fallback only; global settings override this address for other installations.
	private static readonly fallbackReceiverAddress = '192.168.178.67';
	private receiverAddress = SettingsService.fallbackReceiverAddress;

	/** Returns whether a global-settings event changes the effective receiver address. */
	public hasReceiverChanged(settings: YamahaGlobalSettings): boolean {
		const address = settings.receiverAddress?.trim() || SettingsService.fallbackReceiverAddress;
		if (address === this.receiverAddress) return false;
		this.receiverAddress = address;
		return true;
	}

	/** Reads the trimmed global receiver address or the local default when no address is configured. */
	public async getReceiverAddress(): Promise<string> {
		const settings = await streamDeck.settings.getGlobalSettings<YamahaGlobalSettings>();

		const receiverAddress = settings.receiverAddress?.trim();

		if (receiverAddress) {
			return receiverAddress;
		}

		return SettingsService.fallbackReceiverAddress;
	}
}
