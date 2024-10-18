/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { libraryGenerator } from '@nx/angular/generators';
import { formatFiles, generateFiles, getWorkspaceLayout, joinPathFragments, names, Tree } from '@nx/devkit';
import { deleteGenreratedFiles } from '../common';
import { FpaLibraryGeneratorSchema } from './schema';

export default async function fpaLibraryGenerator(tree: Tree, options: FpaLibraryGeneratorSchema) {
	// Set the default project name to the name of the directory
	options.name = names(options.name).fileName;

	options.onlyConfig || (await libraryGenerator(tree, options));
	const libsDir = getWorkspaceLayout(tree).libsDir;
	const filesDir = joinPathFragments(__dirname, './files');
	let projectRoot = '';

	if (options.directory) {
		projectRoot = joinPathFragments(libsDir, options.directory, options.name);
	} else {
		projectRoot = joinPathFragments(libsDir, options.name);
	}

	if (!options.onlyConfig) {
		generateFiles(tree, filesDir, projectRoot, { ...names(options.name), temp: '' });
		deleteGenreratedFiles(tree, projectRoot);
	}

	await formatFiles(tree);
}
