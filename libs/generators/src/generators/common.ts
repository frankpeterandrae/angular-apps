/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { Tree } from '@nx/devkit';

/**
 * Deletes the generated `nx-welcome.component.ts` file from the specified project root.
 * @param tree - The file system tree to operate on.
 * @param projectRoot - The root directory of the project.
 */
export function deleteGeneratedFiles(tree: Tree, projectRoot: string): void {
	tree.delete(`${projectRoot}/../nx-welcome.component.ts`);
}
