/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Tree } from '@nx/devkit';

export function deleteGenreratedFiles(tree: Tree, projectRoot: string): void {
	tree.delete(`${projectRoot}/../nx-welcome.component.ts`);
}
