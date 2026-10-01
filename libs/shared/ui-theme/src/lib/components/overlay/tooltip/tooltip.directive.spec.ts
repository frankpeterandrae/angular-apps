/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { setupTestingModule } from '../../../../test-setup';

import { TooltipDirective } from './tooltip.directive';

@Component({
	imports: [TooltipDirective],
	template: ` <button themeTooltip="Test Tooltip">Help</button> `
})
class TestHostComponent {}

@Component({
	imports: [TooltipDirective],
	template: ` <button themeTooltip="">Help</button> `
})
class EmptyTooltipHostComponent {}

describe('TooltipDirective', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let button: HTMLButtonElement;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [TestHostComponent]
		});

		fixture = TestBed.createComponent(TestHostComponent);
		fixture.detectChanges();

		button = fixture.nativeElement.querySelector('button');
	});

	it('should show the tooltip on mouse enter', () => {
		button.dispatchEvent(new MouseEvent('mouseenter'));

		const tooltip = button.querySelector('[role="tooltip"]');

		expect(tooltip).not.toBeNull();
		expect(tooltip?.textContent).toBe('Test Tooltip');
	});

	it('should hide the tooltip on mouse leave', () => {
		button.dispatchEvent(new MouseEvent('mouseenter'));
		button.dispatchEvent(new MouseEvent('mouseleave'));

		expect(button.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('should show the tooltip when the host receives focus', () => {
		button.dispatchEvent(new FocusEvent('focusin'));

		expect(button.querySelector('[role="tooltip"]')).not.toBeNull();
	});

	it('should hide the tooltip when focus leaves the host', () => {
		button.dispatchEvent(new FocusEvent('focusin'));
		button.dispatchEvent(new FocusEvent('focusout'));

		expect(button.querySelector('[role="tooltip"]')).toBeNull();
	});

	it('should associate the host with the tooltip', () => {
		button.dispatchEvent(new FocusEvent('focusin'));

		const tooltip = button.querySelector('[role="tooltip"]') as HTMLElement;

		expect(tooltip.id).not.toBe('');
		expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
	});

	it('should remove aria-describedby when the tooltip is hidden', () => {
		button.dispatchEvent(new FocusEvent('focusin'));
		button.dispatchEvent(new FocusEvent('focusout'));

		expect(button.hasAttribute('aria-describedby')).toBe(false);
	});

	it('should not show an empty tooltip', () => {
		const emptyFixture = TestBed.createComponent(EmptyTooltipHostComponent);

		emptyFixture.detectChanges();

		const emptyButton = emptyFixture.nativeElement.querySelector('button');

		emptyButton.dispatchEvent(new MouseEvent('mouseenter'));

		expect(emptyButton.querySelector('[role="tooltip"]')).toBeNull();
	});
});
