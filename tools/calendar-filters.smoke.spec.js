const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { resolveBaseUrl } = require('./smoke-config');

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
    // T-803: Robust Fallback
    console.warn('WARN: No pre-market files found. Falling back to mid-day or post-market if available.');
    const anyPosts = fs.readdirSync(postsDir)
      .filter((name) => /^(mid-day|post-market)-\d{4}-\d{2}-\d{2}\.md$/.test(name))
      .sort()
      .reverse();
      
    if (anyPosts.length > 0) {
      const match = anyPosts[0].match(/(mid-day|post-market)-\d{4}-\d{2}-\d{2}/);
      return `/posts/${match[0]}/`;
    }
    
    throw new Error('No post files found for smoke target.');
  }

  const matched = files[0].match(/\d{4}-\d{2}-\d{2}/);
  if (!matched) {
    throw new Error(`Could not parse date from file: ${files[0]}`);
  }

  return `/posts/pre-market-${matched[0]}/`;
}

function buildTargetUrl() {
  const baseUrl = resolveBaseUrl();
  let pagePath = process.env.MP_CALENDAR_PAGE_PATH;
  
  if (!pagePath) {
    try {
      pagePath = resolveLatestPreMarketPath();
    } catch (e) {
      console.error(e.message);
      // Fallback to homepage just to fail gracefully in test or maybe check if there is a 'latest' alias
      // But for calendar smoke, we need a post with calendar data.
      throw e;
    }
  }
  
  console.log(`Targeting Smoke URL: ${new URL(pagePath, baseUrl).toString()}`);
  return new URL(pagePath, baseUrl).toString();
}

test.describe('calendar filter smoke', () => {
  test('importance/period/country filters render safely', async ({ page }) => {
    test.setTimeout(60_000);

    const targetUrl = buildTargetUrl();
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const filters = page.locator('.mp-upcoming__filters');
    await expect(filters).toBeVisible({ timeout: 20_000 });

    const groups = page.locator('.mp-filter-group');
    await expect(groups).toHaveCount(3);

    async function clickPill(groupIndex, label) {
      const group = groups.nth(groupIndex);
      const pill = group.locator('.mp-filter-pill', { hasText: label }).first();
      await expect(pill).toBeVisible();
      await pill.click();
      await expect(pill).toHaveClass(/is-active/);
    }

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

    await clickPill(0, '전체');
    await expectRenderableState();

    await clickPill(0, '상+중');
    await expectRenderableState();

    await clickPill(0, '상');
    await expectRenderableState();

    await clickPill(1, '전체');
    await expectRenderableState();

    await clickPill(1, '±20일');
    await expectRenderableState();

    await clickPill(1, '±10일');
    await expectRenderableState();

    await clickPill(2, '미국');
    await expectRenderableState();

    await clickPill(2, '한국');
    await expectRenderableState();

    await clickPill(2, '전체');
    await expectRenderableState();
  });
});
