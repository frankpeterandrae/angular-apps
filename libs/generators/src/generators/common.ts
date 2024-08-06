import { Tree } from '@nrwl/devkit';

export function deleteGenreratedFiles(tree: Tree, projectRoot: string) {
	tree.delete(`${projectRoot}/../nx-welcome.component.ts`);
}
