/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */
import type { Routes } from '@angular/router';

import { OverlayWrapperComponent } from './overlay/components/overlay-wrapper/overlay-wrapper.component';

/**
 * Route configuration for the stream overlay.
 */
export const overlayRoutes: Routes = [
	{
		path: '',
		component: OverlayWrapperComponent
	}
];
