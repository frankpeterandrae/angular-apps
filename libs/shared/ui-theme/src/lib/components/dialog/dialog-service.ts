/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DIALOG_DATA } from './dialog-tokens';
import { DialogConfigModel } from '../../model/dialog-config.model';

/**
 * Service to manage dialog operations.
 */
@Injectable({
	providedIn: 'root',
})
export class DialogService {
	/**
	 * Constructor to inject the Overlay and Injector services.
	 * @param overlay - The Overlay service to create and manage overlays.
	 * @param injector - The Injector service to create custom injectors.
	 */
	constructor(
		private readonly overlay: Overlay,
		private readonly injector: Injector,
	) {}

	/**
	 * Opens a dialog with the specified component and data.
	 * @param component - The component to be displayed in the dialog.
	 * @param data - The configuration data for the dialog.
	 * @returns The reference to the created overlay.
	 */
	public open(component: any, data: DialogConfigModel<any>): OverlayRef {
		const config: OverlayConfig = {
			hasBackdrop: true,
			backdropClass: 'dark-backdrop',
			panelClass: 'dialog-panel',
			positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
			maxWidth: '90vw',
		};
		const overlayRef = this.overlay.create(config);

		const customInjector = Injector.create({
			providers: [
				{ provide: DIALOG_DATA, useValue: data },
				{ provide: OverlayRef, useValue: overlayRef },
			],
			parent: this.injector,
		});

		const componentPortal = new ComponentPortal(component, null, customInjector);
		overlayRef.attach(componentPortal);

		overlayRef.backdropClick().subscribe(() => overlayRef.dispose());

		return overlayRef;
	}
}
