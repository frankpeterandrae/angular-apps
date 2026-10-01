/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type AfterViewInit, type OnDestroy, Component, computed, DOCUMENT, ElementRef, inject, input, signal } from '@angular/core';

/**
 * Lazily loads an image and swaps in a placeholder while it is not visible or fails to load.
 */
@Component({
	selector: 'theme-image-loader',
	imports: [],
	templateUrl: './image-loader.component.html',
	styleUrl: './image-loader.component.scss'
})
export class ImageLoaderComponent implements AfterViewInit, OnDestroy {
	private readonly elementRef = inject(ElementRef<HTMLElement>);
	private readonly document = inject<Document>(DOCUMENT);

	public readonly src = input.required<string>();
	public readonly alt = input.required<string>();

	protected readonly imageSrc = signal('');
	protected readonly isLoaded = signal(false);

	protected readonly imageSizes = `
		(max-width: 600px) 480px,
		(max-width: 900px) 768px,
		1200px
	`.trim();

	private readonly standardWidths = [480, 768, 1200];
	private observer?: IntersectionObserver;

	private static readonly PLACEHOLDER_SVG = `
	<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
		<rect width="200" height="200" fill="#e0e0e0"/>
		<text
			x="50%"
			y="50%"
			dominant-baseline="middle"
			text-anchor="middle"
			fill="#aaa"
			font-size="20"
		>
			Loading...
		</text>
	</svg>
`;

	protected readonly imageSrcSet = computed<string>(() => {
		const src = this.src();

		if (!src) {
			return '';
		}

		const url = new URL(src, this.document.location.origin);
		const pathname = url.pathname;
		const extensionIndex = pathname.lastIndexOf('.');

		if (extensionIndex === -1) {
			return '';
		}

		const name = pathname.substring(pathname.lastIndexOf('/') + 1, extensionIndex);
		const extension = pathname.substring(extensionIndex);
		const directory = pathname.substring(0, pathname.lastIndexOf('/') + 1);

		return this.standardWidths
			.map((width) => {
				const imageUrl = `${directory}${name}-${width}w${extension}`;

				return `${imageUrl} ${width}w`;
			})
			.join(', ');
	});

	constructor() {
		this.setPlaceholder();
	}

	ngAfterViewInit(): void {
		this.observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					this.loadImage();
					this.observer?.disconnect();
				}
			},
			{
				rootMargin: '50px',
				threshold: 0.01
			}
		);

		this.observer.observe(this.elementRef.nativeElement);
	}

	ngOnDestroy(): void {
		this.observer?.disconnect();
	}

	private setPlaceholder(): void {
		const placeholderUrl = 'data:image/svg+xml;base64,' + btoa(ImageLoaderComponent.PLACEHOLDER_SVG);

		this.imageSrc.set(placeholderUrl);
	}

	private loadImage(): void {
		this.isLoaded.set(false);
		this.imageSrc.set(this.src());
	}

	protected onLoad(): void {
		this.isLoaded.set(true);
	}

	protected onError(): void {
		this.isLoaded.set(false);
		this.setPlaceholder();
	}
}
