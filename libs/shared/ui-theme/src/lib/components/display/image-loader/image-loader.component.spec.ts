/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupTestingModule } from '../../../../test-setup';

import { ImageLoaderComponent } from './image-loader.component';

let intersectionCallback: IntersectionObserverCallback | undefined;

const observe = vi.fn();
const disconnect = vi.fn();

/**
 * DeepMock implementation of IntersectionObserver for testing purposes.
 */
class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		intersectionCallback = callback;
	}

	public observe = observe;
	public disconnect = disconnect;
	public unobserve = vi.fn();
	public takeRecords = vi.fn(() => []);
	public root = null;
	public rootMargin = '';
	public thresholds = [];
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

function triggerIntersection(isIntersecting: boolean): void {
	if (!intersectionCallback) {
		throw new Error('IntersectionObserver callback was not initialized.');
	}

	intersectionCallback(
		[
			{
				isIntersecting
			} as IntersectionObserverEntry
		],
		{} as IntersectionObserver
	);
}

describe('ImageLoaderComponent', () => {
	let component: ImageLoaderComponent;
	let fixture: ComponentFixture<ImageLoaderComponent>;

	beforeEach(async () => {
		observe.mockClear();
		disconnect.mockClear();
		intersectionCallback = undefined;

		await setupTestingModule({
			imports: [ImageLoaderComponent]
		});

		fixture = TestBed.createComponent(ImageLoaderComponent);

		fixture.componentRef.setInput('src', '/image.jpg');
		fixture.componentRef.setInput('alt', 'Test Image');

		fixture.detectChanges();
	});

	it('should render a placeholder before the image enters the viewport', () => {
		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		expect(image.src).toContain('data:image/svg+xml');
		expect(image.classList.contains('loaded')).toBe(false);
	});

	it('should observe the component after view initialization', () => {
		expect(observe).toHaveBeenCalledOnce();
	});

	it('should load the actual image when it enters the viewport', () => {
		expect(intersectionCallback).toBeDefined();

		triggerIntersection(true);

		fixture.detectChanges();

		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		expect(image.getAttribute('src')).toContain('/image.jpg');
		expect(disconnect).toHaveBeenCalledOnce();
	});

	it('should keep the placeholder while the image is outside the viewport', () => {
		triggerIntersection(false);

		fixture.detectChanges();

		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		expect(image.src).toContain('data:image/svg+xml');
		expect(disconnect).not.toHaveBeenCalled();
	});

	it('should mark the image as loaded after the load event', () => {
		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		image.dispatchEvent(new Event('load'));
		fixture.detectChanges();

		expect(image.classList.contains('loaded')).toBe(true);

		expect(fixture.nativeElement.querySelector('.fpa-spinner')).toBeNull();
	});

	it('should restore the placeholder after an image error', () => {
		triggerIntersection(true);

		fixture.detectChanges();

		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		image.dispatchEvent(new Event('error'));
		fixture.detectChanges();

		expect(image.src).toContain('data:image/svg+xml');
		expect(image.classList.contains('loaded')).toBe(false);
	});

	it('should generate responsive image sources', () => {
		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		const srcset = image.getAttribute('srcset');

		expect(srcset).toContain('/image-480w.jpg 480w');
		expect(srcset).toContain('/image-768w.jpg 768w');
		expect(srcset).toContain('/image-1200w.jpg 1200w');
	});

	it('should omit srcset when the source is empty', () => {
		fixture.componentRef.setInput('src', '');
		fixture.detectChanges();

		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		expect(image.getAttribute('srcset')).toBe('');
	});

	it('should omit srcset when the source has no extension', () => {
		fixture.componentRef.setInput('src', '/image');
		fixture.detectChanges();

		const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

		expect(image.getAttribute('srcset')).toBe('');
	});

	it('should disconnect the observer when destroyed', () => {
		fixture.destroy();

		expect(disconnect).toHaveBeenCalledOnce();
	});
});
