/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { setupTestingModule } from '../../../../test-setup';

import { TabGroupComponent } from './tab-group.component';
import { TabComponent } from './tab.component';

// Test wrapper component to hold TabGroup with Tab children
@Component({
	imports: [TabGroupComponent, TabComponent],
	template: `
		<theme-tab-group>
			<theme-tab label="Tab 1">
				<div class="content-1">Content 1</div>
			</theme-tab>

			<theme-tab label="Tab 2">
				<div class="content-2">Content 2</div>
			</theme-tab>

			<theme-tab label="Tab 3">
				<div class="content-3">Content 3</div>
			</theme-tab>
		</theme-tab-group>
	`
})
class TestHostComponent {}

describe('TabGroupComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let tabGroupComponent: TabGroupComponent;

	beforeEach(async () => {
		await setupTestingModule({
			imports: [TestHostComponent, TabGroupComponent, TabComponent]
		});
		fixture = TestBed.createComponent(TestHostComponent);
		fixture.detectChanges();

		// Get reference to TabGroupComponent through directive query
		tabGroupComponent = fixture.debugElement.children[0].componentInstance as TabGroupComponent;
	});

	it('should activate the first tab when none is initially active', () => {
		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('[role="tab"]');

		expect(buttons[0].getAttribute('aria-selected')).toBe('true');
		expect(buttons[1].getAttribute('aria-selected')).toBe('false');
		expect(buttons[2].getAttribute('aria-selected')).toBe('false');
	});

	it('should activate a tab with Space', async () => {
		await fixture.whenStable();
		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('[role="tab"]');

		const event = new KeyboardEvent('keydown', {
			key: ' ',
			bubbles: true,
			cancelable: true
		});

		buttons[2].dispatchEvent(event);
		fixture.detectChanges();

		expect(event.defaultPrevented).toBe(true);
		expect(buttons[2].getAttribute('aria-selected')).toBe('true');
	});

	it('should render configured tab headers', () => {
		const buttons = fixture.nativeElement.querySelectorAll('[role="tab"]');

		expect(buttons).toHaveLength(3);
		expect(buttons[0].textContent).toContain('Tab 1');
		expect(buttons[1].textContent).toContain('Tab 2');
		expect(buttons[2].textContent).toContain('Tab 3');
	});

	it('should expose tab semantics', () => {
		expect(fixture.nativeElement.querySelector('[role="tablist"]')).not.toBeNull();

		expect(fixture.nativeElement.querySelectorAll('[role="tab"]')).toHaveLength(3);
	});
});
