/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

import { readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import fpaLibraryGenerator from './generator';
import { FpaLibraryGeneratorSchema } from './schema';

describe('fpa-library generator', () => {
	let tree: Tree;
	const options: FpaLibraryGeneratorSchema = { directory: '', name: 'test' };

	beforeEach(() => {
		tree = createTreeWithEmptyWorkspace();
	});

	it('should run successfully', async () => {
		await fpaLibraryGenerator(tree, options);
		const config = readProjectConfiguration(tree, 'test');
		expect(config).toBeTruthy();
	});
});
