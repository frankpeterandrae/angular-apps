/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { setupTestingModule } from '../../../../test-setup';

import { TextareaDemoComponent } from './textarea-demo.component';

describe('TextareaDemoComponent', () => {
	let fixture: ComponentFixture<TextareaDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [TextareaDemoComponent]
		});

		fixture = TestBed.createComponent(TextareaDemoComponent);
		fixture.detectChanges();
	});

	it('should render the textarea examples', () => {
		const textareas = fixture.nativeElement.querySelectorAll('theme-textarea');

		expect(textareas).toHaveLength(3);
	});
});
