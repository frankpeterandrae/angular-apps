/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

interface DialogSettings {
	title?: string;
	onClose?: () => any;
	onAccept?: () => any;
	onDecline?: () => any;
}

export interface DialogConfigModel<T> {
	componentData: T;
	settings: DialogSettings;
}
