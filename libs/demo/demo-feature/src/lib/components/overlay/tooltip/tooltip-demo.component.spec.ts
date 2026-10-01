/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from '@application-platform/shared/ui-theme';

import { setupTestingModule } from '../../../../test-setup';

import { TooltipDemoComponent } from './tooltip-demo.component';

describe('TooltipDemoComponent', () => {
	let fixture: ComponentFixture<TooltipDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [TooltipDemoComponent] });
		fixture = TestBed.createComponent(TooltipDemoComponent);
		fixture.detectChanges();
	});

	it('should render the tooltip examples', () => {
		expect(fixture.debugElement.queryAll(By.directive(TooltipDirective))).toHaveLength(3);
	});
});
