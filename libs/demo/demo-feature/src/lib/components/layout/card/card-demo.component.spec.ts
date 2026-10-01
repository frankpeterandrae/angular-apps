/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { CardDemoComponent } from './card-demo.component';

describe('CardDemoComponent', () => {
	let fixture: ComponentFixture<CardDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [CardDemoComponent] });
		fixture = TestBed.createComponent(CardDemoComponent);
		fixture.detectChanges();
	});

	it('should render the card examples', () => {
		expect(fixture.nativeElement.querySelectorAll('.card-demo-example')).toHaveLength(3);
	});
});
