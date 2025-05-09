import { test, expect } from '@playwright/test';

test.describe('Recipe Creation Page Profile Preferences', () => {
  test.beforeEach(async ({ page }) => {
    // Login and set up test data
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to profile page and set preferences
    await page.goto('/profile');
    await page.click('[data-testid="lifestyle-pref-Vegan"]');
    await page.click('[data-testid="lifestyle-pref-Vegetarian"]');
    await page.click('[data-testid="lifestyle-pref-Flexitarian"]');
    await page.click('[data-testid="lifestyle-pref-Keto"]');
    await page.click('[data-testid="save-preferences"]');

    // Wait for preferences to be saved
    await page.waitForSelector('[data-testid="preferences-saved"]');
  });

  test('should load profile preferences when toggling Use Profile Preferences', async ({ page }) => {
    // Navigate to create recipe page
    await page.goto('/create');

    // Click the Use Profile Preferences toggle
    await page.click('[data-testid="use-profile-prefs"]');

    // Verify that the correct preferences are selected
    await expect(page.locator('[data-testid="lifestyle-pref-Vegan"].selected')).toBeVisible();
    await expect(page.locator('[data-testid="lifestyle-pref-Vegetarian"].selected')).toBeVisible();
    await expect(page.locator('[data-testid="lifestyle-pref-Flexitarian"].selected')).toBeVisible();
    await expect(page.locator('[data-testid="lifestyle-pref-Keto"].selected')).toBeVisible();

    // Toggle off profile preferences
    await page.click('[data-testid="use-profile-prefs"]');

    // Verify that no preferences are selected
    await expect(page.locator('[data-testid="lifestyle-pref-Vegan"].selected')).not.toBeVisible();
    await expect(page.locator('[data-testid="lifestyle-pref-Vegetarian"].selected')).not.toBeVisible();
    await expect(page.locator('[data-testid="lifestyle-pref-Flexitarian"].selected')).not.toBeVisible();
    await expect(page.locator('[data-testid="lifestyle-pref-Keto"].selected')).not.toBeVisible();
  });

  test('should update immediately when profile preferences change', async ({ page }) => {
    // Open create recipe page in one tab
    await page.goto('/create');
    await page.click('[data-testid="use-profile-prefs"]');

    // Open profile page in new tab
    const profilePage = await page.context().newPage();
    await profilePage.goto('/profile');

    // Update preferences in profile page
    await profilePage.click('[data-testid="lifestyle-pref-Vegan"]');
    await profilePage.click('[data-testid="save-preferences"]');

    // Verify that create recipe page updates automatically
    await expect(page.locator('[data-testid="lifestyle-pref-Vegan"].selected')).not.toBeVisible();
  });
});