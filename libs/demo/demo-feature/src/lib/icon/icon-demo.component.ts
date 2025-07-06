/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { FastSvgComponent } from '@push-based/ngx-fast-svg';
import { TooltipDirective } from '@angular-apps/shared/ui-theme';

/**
 *
 */
@Component({
	selector: 'demo-icon',
	imports: [FastSvgComponent, TooltipDirective],
	templateUrl: './icon-demo.component.html',
})
export class IconDemoComponent {
	public icons = ['check', 'close', 'home', 'menu', 'paintbrush', 'search'];
}
