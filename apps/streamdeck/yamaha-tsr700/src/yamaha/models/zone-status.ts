export interface ZoneStatus {
	power: 'On' | 'Standby';
	mute?: boolean;
	volume?: number;
	maxVolume?: number;
	actualVolume?: number;
	input?: string;
	inputText?: string;
}
