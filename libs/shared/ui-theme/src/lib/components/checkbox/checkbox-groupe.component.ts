/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';
import { FloatingLabelDirective } from '../../directives/floating-lable';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxConfig } from './checkbox-config.model';

/**
 *
 */
@Component({
	selector: 'theme-checkbox-groupe',
	imports: [CommonModule, FastSvgComponent, FloatingLabelDirective, CheckboxComponent],
	templateUrl: './checkbox-groupe.component.html',
	styleUrl: './checkbox-groupe.component.scss',
})
export class CheckboxGroupeComponent {
	public label = input<string>('');
	public checkboxes = input<CheckboxConfig[]>([]);
}
