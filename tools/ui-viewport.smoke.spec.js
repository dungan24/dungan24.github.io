const fs = require('node:fs');
const path = require('node:path');
const { test } = require('playwright/test');

const VIEWPORTS = [
  { name: 'fhd', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

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
    throw new Error('No pre-market post files found for UI checks.');
  }

  const matched = files[0].match(/\d{4}-\d{2}-\d{2}/);
  if (!matched) {
    throw new Error(`Could not parse date from file: ${files[0]}`);
  }

  return `/posts/pre-market-${matched[0]}/`;
}

function buildTargetUrl(pathname) {
  const baseUrl = process.env.MP_BASE_URL || 'http://localhost:1314';
  return new URL(pathname, baseUrl).toString();
}

function ensureOutputDir() {
  const outDir = path.join(process.cwd(), 'docs', 'screenshots', 'ui-checks');
  fs.mkdirSync(outDir, { recursive: true });
  return outDir;
}

async function captureViewports(page, slug) {
  const outDir = ensureOutputDir();

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const fileName = `${slug}-${viewport.name}.png`;
    await page.screenshot({
      path: path.join(outDir, fileName),
      fullPage: true
    });
  }
}

test.describe('ui viewport captures', () => {
  test('home + latest pre-market', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(buildTargetUrl('/'), { waitUntil: 'networkidle' });
    await captureViewports(page, 'home');

    await page.goto(buildTargetUrl(resolveLatestPreMarketPath()), { waitUntil: 'networkidle' });
    await captureViewports(page, 'pre-market');
  });
});
