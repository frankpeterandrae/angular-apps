export type NetUsbPlaybackStatus = 'play' | 'stop' | 'pause' | 'fast_reverse' | 'fast_forward';

export interface NetUsbPlayInfo {
	input: string;
	playback: NetUsbPlaybackStatus;
	repeat?: string;
	shuffle?: string;
	playTime?: number;
	totalTime?: number;
	artist?: string;
	album?: string;
	track?: string;
	albumArtUrl?: string;
	albumArtId?: number;
}
