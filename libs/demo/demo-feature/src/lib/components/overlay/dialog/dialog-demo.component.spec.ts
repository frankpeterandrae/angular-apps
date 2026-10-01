/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent, DialogComponent, DialogService, DialogType } from '@application-platform/shared/ui-theme';
import { type Mocked, createMock } from '@application-platform/testing';
import { vi } from 'vitest';

import { setupTestingModule } from '../../../../test-setup';

import { DialogDemoComponent } from './dialog-demo.component';

describe('DialogDemoComponent', () => {
	let fixture: ComponentFixture<DialogDemoComponent>;
	let dialogService: Mocked<DialogService>;

	beforeEach(async () => {
		dialogService = createMock<DialogService>({ open: vi.fn() });

		await setupTestingModule({
			imports: [DialogDemoComponent],
			providers: [{ provide: DialogService, useValue: dialogService }]
		});

		fixture = TestBed.createComponent(DialogDemoComponent);
		fixture.detectChanges();
	});

	it('should open the basic dialog from the demo button', () => {
		const button = fixture.debugElement.query(By.directive(ButtonComponent)).componentInstance as ButtonComponent;

		button.buttonClick.emit();

		expect(dialogService.open).toHaveBeenCalledWith(DialogComponent, {
			componentData: undefined,
			settings: {
				title: 'Basic Dialog',
				type: DialogType.INFO
			}
		});
	});
});
