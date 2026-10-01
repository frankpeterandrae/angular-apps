/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

/**
 * Displays a tooltip for the host element.
 */
@Directive({
	selector: '[themeTooltip]',
	standalone: true
})
export class TooltipDirective {
	private readonly elementRef = inject(ElementRef<HTMLElement>);
	private readonly renderer = inject(Renderer2);

	/**
	 * The text to be displayed inside the tooltip.
	 */
	public themeTooltip = input<string>('');
	private tooltipElement: HTMLElement | null = null;
	private static nextId = 0;
	private readonly tooltipId = `theme-tooltip-${TooltipDirective.nextId++}`;

	/** Shows the tooltip when the host is hovered or focused. */
	@HostListener('mouseenter')
	@HostListener('focusin')
	protected showTooltip(): void {
		const text = this.themeTooltip().trim();

		if (!text) {
			return;
		}

		if (!this.tooltipElement) {
			this.tooltipElement = this.renderer.createElement('span');
			this.renderer.appendChild(this.tooltipElement, this.renderer.createText(text));
		}
		this.renderer.appendChild(this.elementRef.nativeElement, this.tooltipElement);
		this.renderer.addClass(this.tooltipElement, 'fpa-tooltip');

		// Ensure the parent element has relative positioning
		this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'relative');

		// Set the tooltip position relative to the parent element
		this.renderer.setStyle(this.tooltipElement, 'top', '100%'); // Directly below the element
		this.renderer.setStyle(this.tooltipElement, 'left', '0'); // Align left
		this.renderer.setAttribute(this.tooltipElement, 'id', this.tooltipId);
		this.renderer.setAttribute(this.tooltipElement, 'role', 'tooltip');
		this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-describedby', this.tooltipId);
	}

	/** Hides the tooltip when hover or focus leaves the host. */
	@HostListener('mouseleave')
	@HostListener('focusout')
	protected hideTooltip(): void {
		if (this.tooltipElement) {
			this.renderer.removeChild(this.elementRef.nativeElement, this.tooltipElement);
			this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-describedby');
			this.tooltipElement = null;
		}
	}
}
