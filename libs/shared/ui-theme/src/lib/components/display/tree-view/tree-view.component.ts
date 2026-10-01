/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';

/** Leaf node containing selectable application data. */
export type LeafItem<T> = {
	label: string;
	id: string;
	type: 'leaf';
	content: T;
};

/** Folder node containing nested tree items. */
export type FolderItem = {
	label: string;
	id: string;
	type: 'folder';
	expanded: boolean;
	children: TreeItems[];
};

export type TreeItems = FolderItem | LeafItem<unknown>;

/**
 * Renders a hierarchical tree of folders and selectable leaf items.
 */
@Component({
	selector: 'theme-tree-view',
	imports: [NgTemplateOutlet],
	templateUrl: './tree-view.component.html',
	styleUrl: './tree-view.component.scss'
})
export class TreeViewComponent {
	public items = input.required<TreeItems[]>();

	public readonly selectedItem = output<LeafItem<unknown>>();

	protected isFolderItem(item: TreeItems | undefined | null): item is FolderItem {
		return item?.type === 'folder';
	}

	protected toggleFolder(item: TreeItems): void {
		if (this.isFolderItem(item)) {
			item.expanded = !item.expanded;
		}
	}

	protected isFolderOpen(item: TreeItems): boolean {
		return this.isFolderItem(item) ? item.expanded : false;
	}

	protected selectLeaf(item: LeafItem<unknown>): void {
		this.selectedItem.emit(item);
	}
}
