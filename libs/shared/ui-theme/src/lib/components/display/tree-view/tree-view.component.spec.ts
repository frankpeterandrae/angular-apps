/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupTestingModule } from '../../../../test-setup';

import { TreeViewComponent, type TreeItems } from './tree-view.component';

describe('TreeViewComponent', () => {
	let fixture: ComponentFixture<TreeViewComponent>;
	let component: TreeViewComponent;

	let items: TreeItems[];

	beforeEach(async () => {
		await setupTestingModule({
			imports: [TreeViewComponent]
		});

		items = [
			{
				id: 'folder',
				label: 'Folder',
				type: 'folder',
				expanded: false,
				children: [
					{
						id: 'file',
						label: 'File',
						type: 'leaf',
						content: 'content'
					}
				]
			},
			{
				id: 'standalone',
				label: 'Standalone',
				type: 'leaf',
				content: 'standalone content'
			}
		];

		fixture = TestBed.createComponent(TreeViewComponent);
		component = fixture.componentInstance;

		fixture.componentRef.setInput('items', items);
		fixture.detectChanges();
	});

	it('should render root tree items', () => {
		const folder = fixture.nativeElement.querySelector('.theme-tree-view-folder');
		const leaf = fixture.nativeElement.querySelector('.theme-tree-view-leaf');

		expect(folder).not.toBeNull();
		expect(folder.textContent).toContain('Folder');
		expect(leaf.textContent).toContain('Standalone');
	});

	it('should hide folder children while collapsed', () => {
		expect(fixture.nativeElement.querySelector('.theme-tree-view-folder-children')).toBeNull();

		expect(fixture.nativeElement.textContent).not.toContain('File');
	});

	it('should show folder children when the folder is opened', () => {
		const folderButton = fixture.nativeElement.querySelector('.theme-tree-view-folder-header') as HTMLButtonElement;

		folderButton.click();
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.theme-tree-view-folder-children')).not.toBeNull();

		expect(fixture.nativeElement.textContent).toContain('File');
	});

	it('should collapse an open folder', () => {
		const folderButton = fixture.nativeElement.querySelector('.theme-tree-view-folder-header') as HTMLButtonElement;

		folderButton.click();
		fixture.detectChanges();

		folderButton.click();
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('.theme-tree-view-folder-children')).toBeNull();
	});

	it('should emit the selected leaf item', () => {
		const emitSpy = vi.spyOn(component.selectedItem, 'emit');

		const leafButton = fixture.nativeElement.querySelector('.theme-tree-view-leaf') as HTMLButtonElement;

		leafButton.click();

		expect(emitSpy).toHaveBeenCalledWith(items[1]);
	});

	it('should open a folder with Enter', () => {
		const folderButton = fixture.nativeElement.querySelector('.theme-tree-view-folder-header') as HTMLButtonElement;

		folderButton.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'Enter',
				bubbles: true
			})
		);

		fixture.detectChanges();

		expect(fixture.nativeElement.textContent).toContain('File');
	});
});
