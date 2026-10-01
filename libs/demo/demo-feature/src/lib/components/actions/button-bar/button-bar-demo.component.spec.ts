/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '@application-platform/shared/ui-theme';

import { setupTestingModule } from '../../../../test-setup';

import { ButtonBarDemoComponent } from './button-bar-demo.component';

describe('ButtonBarDemoComponent', () => {
	let fixture: ComponentFixture<ButtonBarDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ButtonBarDemoComponent]
		});

		fixture = TestBed.createComponent(ButtonBarDemoComponent);
		fixture.detectChanges();
	});

	it('should render the button bar examples', () => {
		const buttonBars = fixture.nativeElement.querySelectorAll('theme-button-bar');

		expect(buttonBars).toHaveLength(3);
	});

	it('should execute every configured demo action', () => {
		const buttons = fixture.debugElement.queryAll(By.directive(ButtonComponent));

		expect(buttons).toHaveLength(6);

		for (const button of buttons) {
			button.componentInstance.buttonClick.emit();
		}
	});
});
