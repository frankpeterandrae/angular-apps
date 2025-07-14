/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorsComponent } from './colors.component';
import { setupTestingModule } from '../../test-setup';

describe('TypographyComponent', () => {
	let component: ColorsComponent;
	let fixture: ComponentFixture<ColorsComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [ColorsComponent]
		});

		fixture = TestBed.createComponent(ColorsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
