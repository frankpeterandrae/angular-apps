/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { expect, test } from '@playwright/test';

test('loads the starmap editor', async ({ page }) => {
	await page.goto('/');

	const editor = page.locator('starmap-editor-container');

	await expect(editor).toBeVisible();
	await expect(editor.locator('starmap-container')).toBeVisible();
});
