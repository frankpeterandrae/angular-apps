#!/usr/bin/env node
/*
 * Copyright (c) 2025. Frank-Peter Andrä
 * All rights reserved.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitRoot() {
	try {
		const root = execSync('git rev-parse --show-toplevel').toString().trim();
		return root;
	} catch (error) {
		console.error('Not a git repository or error:', error);
		process.exit(1);
	}
}

function listGitFiles() {
	try {
		const files = execSync('git ls-tree -r HEAD --name-only').toString().trim().split('\n');
		// Filter for common code file extensions
		const codeExtensions = ['.js', '.ts', '.php', '.scss', '.html'];
		const codeFiles = files.filter((file) => {
			const ext = path.extname(file);
			return codeExtensions.includes(ext);
		});
		return codeFiles;
	} catch (error) {
		console.error('Failed to list files from git:', error);
		process.exit(1);
	}
}

function hasCopyrightHeader(filePath) {
	try {
		const fileContent = fs.readFileSync(filePath, 'utf8');
		// Customize the regex to match your copyright header format
		const copyrightRegex = /All rights reserved\./;
		return copyrightRegex.test(fileContent);
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error.message);
		return true; // Assume it has a header to avoid listing if unreadable
	}
}

function findFilesWithoutCopyrightHeader() {
	const gitRoot = getGitRoot();
	const allFiles = listGitFiles();
	const filesWithoutHeader = [];

	allFiles.forEach((file) => {
		const absolutePath = path.join(gitRoot, file);
		if (!hasCopyrightHeader(absolutePath)) {
			filesWithoutHeader.push(file);
		}
	});

	return filesWithoutHeader;
}

// Main execution
const filesWithoutCopyright = findFilesWithoutCopyrightHeader();

if (filesWithoutCopyright.length > 0) {
	console.log('Files without copyright header:');
	filesWithoutCopyright.forEach((file) => console.log(file));
	process.exit(1);
} else {
	console.log('All files have a copyright header.');
}
