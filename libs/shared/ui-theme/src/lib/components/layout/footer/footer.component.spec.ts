/*
 * Copyright (c) 2024-2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
	let component: FooterComponent;
	let fixture: ComponentFixture<FooterComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [FooterComponent]
		});

		fixture = TestBed.createComponent(FooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should render the application footer', () => {
		const footer = fixture.nativeElement.querySelector('footer');

		expect(footer).not.toBeNull();
		expect(footer.textContent).toContain('Frank-Peter Andrä');
	});
});
