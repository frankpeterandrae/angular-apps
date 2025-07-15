/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, inject } from '@angular/core';

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
	imports: [ButtonComponent],
	templateUrl: './dialog.component.html',
	styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
	private readonly overlayRef = inject(OverlayRef);
	public data = inject<DialogConfigModel<any>>(DIALOG_DATA);

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
