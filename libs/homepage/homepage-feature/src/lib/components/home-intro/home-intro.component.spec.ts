/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../test-setup';

import { HomeIntroComponent } from './home-intro.component';

describe('HomeIntroComponent', () => {
	let fixture: ComponentFixture<HomeIntroComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [HomeIntroComponent]
		});

		fixture = TestBed.createComponent(HomeIntroComponent);
		fixture.detectChanges();
	});

	it('should render the translated intro paragraph', () => {
		const paragraph = fixture.nativeElement.querySelector('.fpa-flex-align-self-start > p');

		expect(paragraph).not.toBeNull();
		expect(paragraph.textContent).toContain('homepageFeatureI18n.HomeIntroComponent.lbl.Paragraph1');
	});

	it('should render the contact email link', () => {
		const link = fixture.nativeElement.querySelector('a[href="mailto:admin@frankpeterandrae.de"]');

		expect(link).not.toBeNull();
		expect(link.textContent?.trim()).toBe('admin@frankpeterandrae.de');
	});
});
