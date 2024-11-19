/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
import { TestBed } from '@angular/core/testing';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { DialogService } from './dialog-service';
import { ComponentPortal } from '@angular/cdk/portal';
import { DialogConfigModel } from '../../model/dialog-config.model';

describe('DialogService', () => {
	let service: DialogService;
	let overlay: Overlay;
	let createSpy: jest.SpyInstance;
	let attachSpy: jest.SpyInstance;
	let backdropClickSpy: jest.SpyInstance;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [DialogService, Overlay, Injector],
		});

		service = TestBed.inject(DialogService);
		overlay = TestBed.inject(Overlay);

		// Spies to mock Overlay behavior
		const mockOverlayRef: Partial<OverlayRef> = {
			attach: jest.fn(),
			backdropClick: jest.fn().mockReturnValue({
				subscribe: jest.fn(),
			}),
			dispose: jest.fn(),
		};
		createSpy = jest.spyOn(overlay, 'create').mockReturnValue(mockOverlayRef as OverlayRef);
		attachSpy = jest.spyOn(mockOverlayRef, 'attach');
		backdropClickSpy = jest.spyOn(mockOverlayRef, 'backdropClick');
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should open a dialog and attach the component to the overlay', () => {
		const mockComponent = jest.fn(); // Mock component
		const mockData: DialogConfigModel<any> = { settings: undefined, componentData: 'test data' };

		const overlayRef = service.open(mockComponent, mockData);

		// Verify that Overlay.create was called with the correct config
		expect(createSpy).toHaveBeenCalled();
		expect(overlayRef).toBeTruthy();

		// Verify that the component was attached to the overlay
		expect(attachSpy).toHaveBeenCalledWith(expect.any(ComponentPortal));

		// Verify that backdropClick was subscribed to
		expect(backdropClickSpy).toHaveBeenCalled();
	});
});
