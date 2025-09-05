import { by, device, element, expect } from 'detox';

describe('Browser E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the browser homepage', async () => {
    await expect(element(by.text('Aura Browser'))).toBeVisible();
    await expect(element(by.text('Quick Access'))).toBeVisible();
  });

  it('should create a new tab', async () => {
    // Tap on new tab button
    await element(by.id('new-tab-button')).tap();
    
    // Should navigate to Google
    await expect(element(by.text('Google'))).toBeVisible();
  });

  it('should navigate between tabs', async () => {
    // Open tabs screen
    await element(by.id('tabs-button')).tap();
    
    // Should show tabs screen
    await expect(element(by.text('Tabs'))).toBeVisible();
    await expect(element(by.text('Active Tabs'))).toBeVisible();
  });

  it('should search for a website', async () => {
    // Tap on search input
    await element(by.id('search-input')).tap();
    
    // Type search query
    await element(by.id('search-input')).typeText('github.com');
    
    // Submit search
    await element(by.id('search-input')).tapReturnKey();
    
    // Should navigate to GitHub
    await waitFor(element(by.text('GitHub')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('should add and remove bookmarks', async () => {
    // Navigate to a website first
    await element(by.id('search-input')).tap();
    await element(by.id('search-input')).typeText('example.com');
    await element(by.id('search-input')).tapReturnKey();
    
    // Wait for page to load
    await waitFor(element(by.id('bookmark-button')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Add bookmark
    await element(by.id('bookmark-button')).tap();
    
    // Should show success message
    await expect(element(by.text('Bookmark added'))).toBeVisible();
    
    // Remove bookmark
    await element(by.id('bookmark-button')).tap();
    
    // Should show removal message
    await expect(element(by.text('Bookmark removed'))).toBeVisible();
  });

  it('should open settings screen', async () => {
    // Open menu
    await element(by.id('menu-button')).tap();
    
    // Tap settings
    await element(by.text('Settings')).tap();
    
    // Should show settings screen
    await expect(element(by.text('Settings'))).toBeVisible();
    await expect(element(by.text('General'))).toBeVisible();
  });

  it('should toggle dark mode', async () => {
    // Navigate to settings
    await element(by.id('menu-button')).tap();
    await element(by.text('Settings')).tap();
    
    // Find and toggle dark mode switch
    await element(by.id('dark-mode-switch')).tap();
    
    // Should update the setting
    // Note: Visual verification would need additional setup
  });

  it('should change language to Arabic', async () => {
    // Navigate to language settings
    await element(by.id('menu-button')).tap();
    await element(by.text('Settings')).tap();
    await element(by.text('Language')).tap();
    
    // Select Arabic
    await element(by.text('العربية')).tap();
    
    // Should change language
    await expect(element(by.text('الإعدادات'))).toBeVisible();
  });
});