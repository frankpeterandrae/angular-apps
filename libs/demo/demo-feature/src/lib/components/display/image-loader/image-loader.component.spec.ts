/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { setupTestingModule } from '../../../../test-setup';

import { ImageLoaderDemoComponent } from './image-loader.component';

class MockIntersectionObserver {
	public observe = vi.fn();
	public unobserve = vi.fn();
	public disconnect = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('ImageLoaderDemoComponent', () => {
	let fixture: ComponentFixture<ImageLoaderDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [ImageLoaderDemoComponent] });
		fixture = TestBed.createComponent(ImageLoaderDemoComponent);
		fixture.detectChanges();
	});

	it('should render the image loader example', () => {
		expect(fixture.nativeElement.querySelector('theme-image-loader')).not.toBeNull();
	});
});
