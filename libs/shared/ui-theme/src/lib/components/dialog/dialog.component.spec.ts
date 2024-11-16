/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { OverlayRef } from '@angular/cdk/overlay';
import { DIALOG_DATA } from './dialog-tokens';
import { DialogConfigModel } from '../../model/dialog-config.model';
import { setupTestingModule } from '../../../test-setup';

describe('DialogComponent', () => {
	let component: DialogComponent;
	let fixture: ComponentFixture<DialogComponent>;
	let overlayRefMock: jest.Mocked<OverlayRef>;

	beforeEach(async () => {
		overlayRefMock = {
			dispose: jest.fn(),
		} as unknown as jest.Mocked<OverlayRef>;
		const mockDialogData: DialogConfigModel<any> = {
			componentData: undefined,
			settings: { title: 'Test Dialog' },
		};

		await setupTestingModule({
			imports: [DialogComponent],
			providers: [
				{ provide: OverlayRef, useValue: overlayRefMock },
				{ provide: DIALOG_DATA, useValue: mockDialogData },
			],
		});

		fixture = TestBed.createComponent(DialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog when close is called', () => {
		const overlayRefSpy = jest.spyOn(component['overlayRef'], 'dispose');
		component.close();
		expect(overlayRefSpy).toHaveBeenCalled();
	});

	it('should close the dialog when backdropClick is called', () => {
		const overlayRefSpy = jest.spyOn(component['overlayRef'], 'dispose');
		component.backdropClick();
		expect(overlayRefSpy).toHaveBeenCalled();
	});

	it('should not throw error if close is called multiple times', () => {
		const overlayRefSpy = jest.spyOn(component['overlayRef'], 'dispose');
		component.close();
		component.close();
		expect(overlayRefSpy).toHaveBeenCalledTimes(2);
	});

	it('should not throw error if backdropClick is called multiple times', () => {
		const overlayRefSpy = jest.spyOn(component['overlayRef'], 'dispose');
		component.backdropClick();
		component.backdropClick();
		expect(overlayRefSpy).toHaveBeenCalledTimes(2);
	});
});
