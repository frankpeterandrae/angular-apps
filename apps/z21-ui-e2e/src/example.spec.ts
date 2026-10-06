/*
 * Copyright (c) 2026. Frank-Peter Andrä
 * All rights reserved.
 */

import { expect, test } from '@playwright/test';

test('shows the Z21 UI', async ({ page }) => {
	await page.goto('/');

	await expect(page.locator('h1')).toContainText('Z21 UI');
});
