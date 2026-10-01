/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

export enum DialogType {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
	SUCCESS = 'success',
	CONFIRM = 'confirm'
}

interface DialogSettings {
	title: string;
	type: DialogType;
	content?: string;
	acceptText?: string;
	declineText?: string;
	onClose?: () => void;
	onAccept?: () => void;
	onDecline?: () => void;
}

export interface DialogConfigModel<T> {
	componentData: T | undefined;
	settings: DialogSettings;
}
