/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { TooltipDirective } from './tooltip.directive';
import { ElementRef, input, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('TooltipDirective', () => {
	let directive: TooltipDirective;
	let elementRefMock: ElementRef;
	let rendererMock: Renderer2;

	beforeEach(() => {
		// Mock ElementRef and Renderer2
		elementRefMock = { nativeElement: document.createElement('div') } as ElementRef;
		rendererMock = {
			createElement: jest.fn().mockReturnValue(document.createElement('span')),
			createText: jest.fn().mockImplementation((text: string) => document.createTextNode(text)),
			appendChild: jest.fn(),
			addClass: jest.fn(),
			setStyle: jest.fn(),
			removeChild: jest.fn(),
		} as unknown as Renderer2;

		// Mock InputSignal<string>

		TestBed.runInInjectionContext(() => {
			const themeTooltip = input<string>('Test Tooltip');
			directive = new TooltipDirective(elementRefMock, rendererMock);
			directive.themeTooltip = themeTooltip;
		});
	});

	it('should create an instance', () => {
		expect(directive).toBeTruthy();
	});

	it('should create and display the tooltip on mouse enter', () => {
		directive.onMouseEnter();

		expect(rendererMock.createElement).toHaveBeenCalledWith('span');
		expect(rendererMock.createText).toHaveBeenCalledWith('Test Tooltip');
		expect(rendererMock.appendChild).toHaveBeenCalledTimes(2);
		expect(rendererMock.addClass).toHaveBeenCalledWith(expect.any(HTMLElement), 'fpa-tooltip');
		expect(rendererMock.setStyle).toHaveBeenCalledTimes(3);
	});

	it('should remove the tooltip on mouse leave', () => {
		directive.onMouseEnter(); // Add the tooltip first

		directive.onMouseLeave();
		expect(rendererMock.removeChild).toHaveBeenCalledWith(elementRefMock.nativeElement, expect.any(HTMLElement));
		expect(directive['tooltipElement']).toBeNull();
	});
});
