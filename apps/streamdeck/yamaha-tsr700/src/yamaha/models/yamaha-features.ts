import type { JsonObject } from '@elgato/utils';

export type YamahaExtendedZoneId = 'main' | 'zone2' | 'zone3' | 'zone4';

export type YamahaExtendedInputPlayInfoType =
	| 'cd'
	| 'tuner'
	| 'multi_ch'
	| 'phono'
	| 'hdmi1'
	| 'hdmi2'
	| 'hdmi3'
	| 'hdmi4'
	| 'hdmi5'
	| 'hdmi6'
	| 'hdmi7'
	| 'hdmi8'
	| 'hdmi'
	| 'av1'
	| 'av2'
	| 'av3'
	| 'av4'
	| 'av5'
	| 'av6'
	| 'av7'
	| 'v_aux'
	| 'aux1'
	| 'aux2'
	| 'aux'
	| 'audio1'
	| 'audio2'
	| 'audio3'
	| 'audio4'
	| 'audio5'
	| 'audio_cd'
	| 'audio'
	| 'optical1'
	| 'optical2'
	| 'optical'
	| 'coaxial1'
	| 'coaxial2'
	| 'coaxial'
	| 'digital1'
	| 'digital2'
	| 'digital'
	| 'line1'
	| 'line2'
	| 'line3'
	| 'line_cd'
	| 'analog'
	| 'tv'
	| 'bd_dvd'
	| 'usb_dac'
	| 'usb'
	| 'bluetooth'
	| 'server'
	| 'net_radio'
	| 'napster'
	| 'pandora'
	| 'siriusxm'
	| 'spotify'
	| 'juke'
	| 'airplay'
	| 'radiko'
	| 'qobuz'
	| 'tidal'
	| 'deezer'
	| 'mc_link'
	| 'main_sync'
	| 'none';

export interface YamahaExtendedInputFeature {
	id: string;
	distribution_enable?: boolean;
	rename_enable?: boolean;
	account_enable?: boolean;
	play_info_type?: YamahaExtendedInputPlayInfoType;
}

export interface YamahaExtendedSystemFeatures {
	func_list: string[];
	zone_num: number;
	input_list: YamahaExtendedInputFeature[];
}

export interface YamahaExtendedZoneFeatures {
	id: YamahaExtendedZoneId;
	zone_b?: boolean;
	func_list: string[];
	input_list?: string[];
	sound_program_list?: string[];
	scene_num?: number;
}

export interface YamahaExtendedFeatures {
	system: YamahaExtendedSystemFeatures;
	zone: YamahaExtendedZoneFeatures[];
}

export interface NameTextOption {
	id: string;
	text: string;
}

export interface YamahaNameTexts {
	zone_list: NameTextOption[];
	input_list: NameTextOption[];
	sound_program_list: NameTextOption[];
}

export interface GetPowerZonesPayload extends JsonObject {
	event: 'getPowerZones';
}

export interface GetVolumeZonesPayload extends JsonObject {
	event: 'getVolumeZones';
}

export interface GetMuteZonesPayload extends JsonObject {
	event: 'getMuteZones';
}

export interface GetInputZonesPayload extends JsonObject {
	event: 'getInputZones';
}

export interface GetInputsPayload extends JsonObject {
	event: 'getInputs';
}
