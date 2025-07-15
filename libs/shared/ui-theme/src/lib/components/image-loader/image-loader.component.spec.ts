/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageLoaderComponent } from './image-loader.component';
import { setupTestingModule } from '../../../test-setup';

/**
 * Mock implementation of IntersectionObserver for testing purposes.
 */
class MockIntersectionObserver {
	/**
	 * Mock observe method.
	 */
	public observe = jest.fn();

	/**
	 * Mock unobserve method.
	 */
	public unobserve = jest.fn();

	/**
	 * Mock disconnect method.
	 */
	public disconnect = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;
describe('ImageLoaderComponent', () => {
	let component: ImageLoaderComponent;
	let fixture: ComponentFixture<ImageLoaderComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ImageLoaderComponent]
		});

		fixture = TestBed.createComponent(ImageLoaderComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('src', '/image.jpg');
		fixture.componentRef.setInput('alt', 'Test Image');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set placeholder image on initialization', () => {
		expect(component.imageSrc.toString()).toContain('data:image/svg+xml;base64');
	});

	it('should load actual image when in view', () => {
		const loadImageSpy = jest.spyOn(component, 'ngAfterViewInit');
		component.ngAfterViewInit();
		component['observer'].observe(fixture.nativeElement);
		expect(loadImageSpy).toHaveBeenCalled();
	});

	it('should set isLoaded to true on image load', () => {
		component['loadImage']();
		expect(component.isLoaded).toBe(false);
	});

	it('should set isLoaded to true on image load', () => {
		component.onLoad();
		expect(component.isLoaded).toBe(true);
	});

	it('should revert to placeholder on image error', () => {
		const setPlaceholderSpy = jest.spyOn(component, 'onError');
		component.onError();
		expect(setPlaceholderSpy).toHaveBeenCalled();
	});

	it('should generate correct srcset attribute', () => {
		fixture.componentRef.setInput('src', '/image.jpg');
		const srcSet = component.imageSrcSet();
		expect(srcSet).toContain('/image-480w.jpg 480w');
		expect(srcSet).toContain('/image-768w.jpg 768w');
		expect(srcSet).toContain('/image-1200w.jpg 1200w');
	});

	it('should not set srcset if src is no extension is provided', () => {
		fixture.componentRef.setInput('src', '/image');
		const srcSet = component.imageSrcSet();
		expect(srcSet).toBe(undefined);
	});

	it('should not set srcset if src is empty', () => {
		fixture.componentRef.setInput('src', '');
		const srcSet = component.imageSrcSet();
		expect(srcSet).toBe('');
	});
});
