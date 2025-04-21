/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonColorDefinition, ButtonComponent } from '@angular-apps/shared/ui-theme';

/**
 *
 */
@Component({
    selector: 'demo-button',
    imports: [CommonModule, ButtonComponent],
    templateUrl: './button-demo.component.html'
})
export class ButtonDemoComponent {
	protected readonly ButtonColorDefinition = ButtonColorDefinition;
}
