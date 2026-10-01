/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { type LeafItem, TreeViewComponent } from '@application-platform/shared/ui-theme';

import { setupTestingModule } from '../../../../test-setup';

import { TreeViewDemoComponent } from './tree-view-demo.component';

describe('TreeViewDemoComponent', () => {
	let fixture: ComponentFixture<TreeViewDemoComponent>;

	beforeEach(async () => {
		await setupTestingModule({ imports: [TreeViewDemoComponent] });
		fixture = TestBed.createComponent(TreeViewDemoComponent);
		fixture.detectChanges();
	});

	it('should render the tree view example', () => {
		expect(fixture.nativeElement.querySelector('theme-tree-view')).not.toBeNull();
	});

	it('should display selected item content', () => {
		const treeView = fixture.debugElement.query(By.directive(TreeViewComponent)).componentInstance as TreeViewComponent;
		const selectedItem: LeafItem<number> = {
			label: 'Leaf 1',
			id: 'leaf1',
			type: 'leaf',
			content: 42
		};

		treeView.selectedItem.emit(selectedItem);
		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('"content": 42');
	});
});
