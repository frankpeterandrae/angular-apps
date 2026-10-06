export type NetUsbPlaybackCommand =
	| 'play'
	| 'pause'
	| 'play_pause'
	| 'stop'
	| 'previous'
	| 'next'
	| 'fast_reverse_start'
	| 'fast_reverse_end'
	| 'fast_forward_start'
	| 'fast_forward_end';

export type NetUsbMediaControlCommand = 'play' | 'pause' | 'play_pause' | 'stop' | 'previous' | 'next' | 'fast_reverse' | 'fast_forward';
