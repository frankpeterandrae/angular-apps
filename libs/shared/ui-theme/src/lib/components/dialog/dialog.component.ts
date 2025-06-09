/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { DIALOG_DATA } from './dialog-tokens';
import { DialogConfigModel } from '../../model/dialog-config.model';
import { ButtonComponent } from '../button/button.component';
import { ButtonColorDefinition } from '../../enums';

/**
 * This component serves as a dialog container.
 * It is used to display a dialog in the application.
 */
@Component({
	selector: 'theme-dialog',
	imports: [CommonModule, ButtonComponent],
	templateUrl: './dialog.component.html',
	styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
	/**
	 * Constructor to inject the overlay reference and dialog data.
	 * @param {OverlayRef} overlayRef - Reference to the overlay.
	 * @param {DialogConfigModel<any>} data - Configuration data for the dialog.
	 */
	constructor(
		private readonly overlayRef: OverlayRef,
		@Inject(DIALOG_DATA) public data: DialogConfigModel<any>,
	) {}

	/**
	 * Closes the dialog by disposing of the overlay reference.
	 */
	public close(): void {
		this.overlayRef.dispose();
	}

	/**
	 * Handles the backdrop click event to close the dialog.
	 */
	public backdropClick(): void {
		this.overlayRef.dispose();
	}

	protected readonly ButtonColorDefinition = ButtonColorDefinition;
}
