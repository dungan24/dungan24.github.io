const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('playwright/test');

function resolveLatestPreMarketPath() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  if (!fs.existsSync(postsDir)) {
    throw new Error(`Posts directory not found: ${postsDir}`);
  }

  const files = fs.readdirSync(postsDir)
    .filter((name) => /^pre-market-\d{4}-\d{2}-\d{2}\.md$/.test(name))
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error('No pre-market post files found for smoke target.');
  }

  const matched = files[0].match(/\d{4}-\d{2}-\d{2}/);
  if (!matched) {
    throw new Error(`Could not parse date from file: ${files[0]}`);
  }

  return `/posts/pre-market-${matched[0]}/`;
}

function buildTargetUrl() {
  const baseUrl = process.env.MP_BASE_URL || 'http://localhost:1314';
  const pagePath = process.env.MP_CALENDAR_PAGE_PATH || resolveLatestPreMarketPath();
  return new URL(pagePath, baseUrl).toString();
}

test.describe('calendar filter smoke', () => {
  test('importance/period/country filters render safely', async ({ page }) => {
    test.setTimeout(60_000);

    const targetUrl = buildTargetUrl();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const filters = page.locator('.mp-upcoming__filters');
    await expect(filters).toBeVisible({ timeout: 20_000 });

    const selects = page.locator('.mp-upcoming__filter-select');
    await expect(selects).toHaveCount(3);

    async function expectRenderableState() {
      await expect(async () => {
        const itemCount = await page.locator('.mp-upcoming__item').count();
        const emptyCount = await page.locator('.mp-upcoming__empty').count();
        if (itemCount === 0 && emptyCount === 0) {
          throw new Error('No rendered upcoming state detected.');
        }
      }).toPass({ timeout: 5_000 });
    }

    await expectRenderableState();

    await selects.nth(0).selectOption('all');
    await expect(selects.nth(0)).toHaveValue('all');
    await expectRenderableState();

    await selects.nth(0).selectOption('high-medium');
    await expect(selects.nth(0)).toHaveValue('high-medium');
    await expectRenderableState();

    await selects.nth(0).selectOption('high');
    await expect(selects.nth(0)).toHaveValue('high');
    await expectRenderableState();

    await selects.nth(1).selectOption('pm30');
    await expect(selects.nth(1)).toHaveValue('pm30');
    await expectRenderableState();

    await selects.nth(1).selectOption('pm20');
    await expect(selects.nth(1)).toHaveValue('pm20');
    await expectRenderableState();

    await selects.nth(1).selectOption('pm10');
    await expect(selects.nth(1)).toHaveValue('pm10');
    await expectRenderableState();

    await selects.nth(2).selectOption('us');
    await expect(selects.nth(2)).toHaveValue('us');
    await expectRenderableState();

    await selects.nth(2).selectOption('kr');
    await expect(selects.nth(2)).toHaveValue('kr');
    await expectRenderableState();

    await selects.nth(2).selectOption('all');
    await expect(selects.nth(2)).toHaveValue('all');
    await expectRenderableState();
  });
});
