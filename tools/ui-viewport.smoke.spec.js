const { test, expect } = require('@playwright/test');
const { resolveBaseUrl } = require('./smoke-config');

// Basic UI Smoke Tests
// These tests verify that critical UI elements are rendered and responsive
// They require the Hugo server to be running (MP_BASE_URL or local default)

const BASE_URL = resolveBaseUrl();

test.describe('Market Pulse UI Smoke', () => {
  
  test('Homepage loads with critical sections', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check Hero
    await expect(page.locator('.mp-heartbeat-title')).toBeVisible();
    
    // Check Ticker Groups
    const tickers = page.locator('.mp-ticker-groups');
    await expect(tickers).toBeVisible();
    
    // Check Briefing Cards
    const cards = page.locator('.mp-briefing-card');
    // Expect at least one card
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('Mobile view shows bottom nav', async ({ page }) => {
    // iPhone 12 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL);
    
    // Check Bottom Nav
    const bottomNav = page.locator('#mp-mobile-bottom-nav');
    await expect(bottomNav).toBeVisible();
    
    // Check Horizontal Scroll on Cards
    const cardContainer = page.locator('.mp-briefing-cards');
    await expect(cardContainer).toHaveCSS('overflow-x', 'auto');
  });

  test('Desktop view hides bottom nav', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);
    
    const bottomNav = page.locator('#mp-mobile-bottom-nav');
    await expect(bottomNav).toBeHidden();
  });

  test('Article page loads with enhancements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Click first briefing card
    const firstCard = page.locator('.mp-briefing-card').first();
    await expect(firstCard).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/posts\//),
      firstCard.click()
    ]);
    
    // Post hero is shown only when front matter contains regime
    const hasRegime = await page.evaluate(() => Boolean(window.__MP_PAGE && window.__MP_PAGE.regime));
    const postHero = page.locator('.mp-post-hero');
    if (hasRegime) {
      await expect(postHero).toBeVisible();
    } else {
      await expect(postHero).toHaveCount(0);
    }
    
    // Check Reading Progress Bar exists (might be 0 width)
    const progressBar = page.locator('#mp-reading-progress');
    // It is injected by JS, wait for it
    await expect(progressBar).toBeAttached();
  });

  test('Theme toggle works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check initial state (should be dark by default in our config usually, but check class)
    // Actually Blowfish defaults to auto or config. We just check if toggle does something.
    
    const html = page.locator('html');
    
    // Find toggle
    const toggle = page.locator('#appearance-switcher').first();
    if (await toggle.isVisible()) {
      await toggle.click();
      // Wait for transition class to appear or disappear
      // Just check if class changed or if transition class was added
      // Our transition script adds 'theme-transition'
      await expect(html).toHaveClass(/theme-transition/);
    }
  });

});
