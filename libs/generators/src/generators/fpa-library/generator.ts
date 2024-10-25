/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { libraryGenerator } from '@nx/angular/generators';
import { formatFiles, generateFiles, getWorkspaceLayout, joinPathFragments, names, Tree } from '@nx/devkit';
import { deleteGeneratedFiles } from '../common';
import { FpaLibraryGeneratorSchema } from './schema';

/**
 * Generates a library project with the specified options.
 * @param {Tree} tree - The file system tree.
 * @param {FpaLibraryGeneratorSchema} options - The options for the library generator.
 * @returns {Promise<void>} A promise that resolves when the generation is complete.
 */
export default async function fpaLibraryGenerator(tree: Tree, options: FpaLibraryGeneratorSchema): Promise<void> {
	// Set the default project name to the name of the directory
	options.name = names(options.name).fileName;

	// If `options.onlyConfig` is false, call the `libraryGenerator` function with `tree` and `options`.
	// The `await` keyword ensures that the function waits for the promise to resolve before continuing.
	if (!options.onlyConfig) {
		await libraryGenerator(tree, options);
	}

	const libsDir = getWorkspaceLayout(tree).libsDir;
	const filesDir = joinPathFragments(__dirname, './files');
	let projectRoot = '';

	// Determine the project root directory based on the provided options
	if (options.directory) {
		projectRoot = joinPathFragments(libsDir, options.directory, options.name);
	} else {
		projectRoot = joinPathFragments(libsDir, options.name);
	}

	// Generate files and delete temporary files if `options.onlyConfig` is false
	if (!options.onlyConfig) {
		generateFiles(tree, filesDir, projectRoot, { ...names(options.name), temp: '' });
		deleteGeneratedFiles(tree, projectRoot);
	}

	// Format the generated files
	await formatFiles(tree);
}
