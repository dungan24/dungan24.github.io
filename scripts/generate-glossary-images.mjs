/**
 * Glossary Illustration Batch Generator
 * — Wall Street legends × real-life analogies × comic strip style
 *
 * Usage:
 *   node scripts/generate-glossary-images.mjs
 *   node scripts/generate-glossary-images.mjs --only per,etf
 *   node scripts/generate-glossary-images.mjs --dry-run
 */

import fs from "node:fs";
import path from "node:path";

// ── .env ──
function loadEnv() {
  for (const p of [".env", "../market-pulse/.env"]) {
    const envPath = path.resolve(process.cwd(), p);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (process.env[k] !== undefined) continue;
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      process.env[k] = v;
    }
  }
}
loadEnv();

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error("No API key"); process.exit(1); }

const MODEL = "gemini-2.5-flash-image";
const OUT_DIR = path.join(process.cwd(), "static", "images", "glossary");

// ── 공통 스타일 지시문 ──
const STYLE = `Style: fun cute editorial caricature with chibi-ish proportions (big head, small body).
Clean bold outlines, flat pastel color fills (soft blue, orange, cream, mint).
Exaggerated funny expressions and gestures. Humorous and adorable tone.
Minimal text — only numbers and short English labels (NO long Korean sentences).
White background, 1024x576 landscape, 3-panel comic strip layout (left to right).`;

// ── 15개 프롬프트 ──
const PROMPTS = [
  {
    id: "per",
    legend: "Warren Buffett — elderly man, round glasses, big warm smile, suit with suspenders, holding a cherry Coca-Cola bottle",
    panels: `Panel 1: Buffett stands in front of a tiny Korean fried chicken shop with a cute awning. He peeks at the price tag "100M" with wide curious eyes, drooling slightly.
Panel 2: A giant thought bubble — a cute jar fills with golden coins. Label: "20M/year". He counts on his tiny fingers, sweating adorably.
Panel 3: Buffett does a victory dance, huge thumbs up, sparkle eyes. "PER = 5x — DEAL!" A red "SOLD" sticker slapped on the shop. Confetti everywhere.`,
  },
  {
    id: "pbr",
    legend: "Benjamin Graham — serious elderly professor type, thick round glasses, bow tie, holding a thick book titled 'Security Analysis'",
    panels: `Panel 1: Graham inspects a cute little apartment building with a magnifying glass. A sign says "Book Value: 500M". He looks skeptical.
Panel 2: A real estate agent (tiny character) shows a "Market Price: 700M" tag. Graham's glasses crack from shock. "PBR = 1.4x!!"
Panel 3: Graham happily finds a discounted apartment with a "Sale! 400M" banner. "PBR = 0.8x — BARGAIN!" He hugs the building with heart eyes.`,
  },
  {
    id: "eps",
    legend: "Peter Lynch — friendly middle-aged man, wavy brown hair, casual sweater, holding a notepad, cheerful grin",
    panels: `Panel 1: Lynch and 3 tiny cute co-investors stand around a pizza shop. A big money bag labeled "Profit: 10M" sits on the counter.
Panel 2: Lynch divides the money into 100 cute little coin stacks. Each stack has a tiny flag: "100 shares". He uses a giant pizza cutter as divider.
Panel 3: Each investor holds their share — one coin stack with "EPS = 100K/share". Lynch gives a wink and thumbs up. Tiny coins have happy faces.`,
  },
  {
    id: "roe",
    legend: "Warren Buffett — elderly man, round glasses, big warm smile, suit with suspenders, cherry Coca-Cola",
    panels: `Panel 1: Buffett drops a bag of coins labeled "1,000M capital" into a cute piggy bank shaped like a factory. The piggy bank smiles.
Panel 2: The factory-piggy-bank works hard (steam puffs, gear icons). Out comes a golden egg labeled "150M profit". Buffett watches with a stopwatch.
Panel 3: Buffett holds up a scoreboard: "ROE = 15% — Excellent!" Stars and sparkles around him. The piggy bank flexes tiny arms proudly.`,
  },
  {
    id: "etf",
    legend: "John Bogle — kind elderly man, simple glasses, modest suit, holding a banner that says 'Keep it simple'",
    panels: `Panel 1: A confused tiny investor stares at a huge wall of individual food dishes (labeled Samsung, SK, Hyundai...). Too many choices! Sweat drops.
Panel 2: Bogle appears like a fairy godfather, waving a magic wand. He transforms everything into one beautiful buffet plate labeled "ETF". Sparkle effects.
Panel 3: The investor happily holds ONE plate with tiny portions of everything. "200 stocks in 1 bite!" Bogle gives a chef's kiss. Both have happy food-coma faces.`,
  },
  {
    id: "gdp",
    legend: "John Maynard Keynes — distinguished gentleman, mustache, three-piece suit, monocle, holding a top hat",
    panels: `Panel 1: A cute tiny village from above — a bakery (100M), chicken shop (200M), hair salon (50M). Each has a cute price bubble. Keynes surveys from a hot air balloon.
Panel 2: Keynes adds up all the bubbles on a giant abacus. The beads are tiny buildings. He squints through his monocle.
Panel 3: A big banner unfurls: "Village GDP = 350M!" Villagers celebrate. Keynes tips his top hat proudly. Confetti rains down.`,
  },
  {
    id: "rsi",
    legend: "Jesse Livermore — dapper 1920s trader, slicked hair, pinstripe suit, cigarette holder, confident smirk",
    panels: `Panel 1: A cute hamster runs on a wheel (the stock market). A heart-rate monitor shows "RSI: 75". The hamster is panting, red-faced. Livermore watches with concern.
Panel 2: Monitor shows "RSI: 30". The hamster collapsed, sleeping with Z's. Livermore pokes it gently. "Wake up little guy..."
Panel 3: The hamster is back to normal speed. Monitor: "RSI: 50 — Healthy!" Livermore gives OK sign. The hamster gives a tiny thumbs up.`,
  },
  {
    id: "macd",
    legend: "Jesse Livermore — dapper 1920s trader, slicked hair, pinstripe suit, confident smirk, holding racing binoculars",
    panels: `Panel 1: Two cute cartoon runners on a track — a fast rabbit (labeled "12d") and a slow turtle (labeled "26d"). Livermore referees with a starting pistol.
Panel 2: The rabbit overtakes the turtle! A golden "X" marks the crossover point. Livermore waves a green flag: "Golden Cross! BUY!" Sparkles everywhere.
Panel 3: The turtle catches up, passes the tired rabbit. Red flag: "Death Cross! SELL!" Livermore blows a whistle dramatically. The rabbit naps.`,
  },
  {
    id: "vix",
    legend: "Nassim Taleb — muscular bald man, thick black beard, intense eyes, wearing a 'Black Swan' t-shirt, arms crossed",
    panels: `Panel 1: A cute weather station. Sunny sky, happy clouds. Gauge shows "VIX: 15 — Calm". Taleb sits reading peacefully but keeps one eye open suspiciously.
Panel 2: Dark clouds roll in! Gauge spikes to "VIX: 35 — FEAR!" Lightning bolts. Taleb stands up, pointing dramatically: "I TOLD YOU SO!"
Panel 3: Full storm — "VIX: 80 — PANIC!" Everyone runs. But Taleb surfs the storm on a black swan, wearing sunglasses, totally cool. "Antifragile, baby!"`,
  },
  {
    id: "bollinger-band",
    legend: "John Bollinger — friendly man with glasses and mustache, casual shirt, holding a rubber band between his hands",
    panels: `Panel 1: A cute bouncy ball (the stock price) bounces inside a stretchy rubber tube. Bollinger stretches the tube wide. Ball bounces happily: "Normal range!"
Panel 2: The ball hits the TOP of the tube — "BOING!" Bollinger winces. "Overbought! Gonna snap back!" The tube is stretched to max.
Panel 3: The tube squeezes super tight (Bollinger pushes walls together). The ball is compressed, vibrating. "Squeeze! Something BIG is coming!" Dramatic tension marks.`,
  },
  {
    id: "base-rate",
    legend: "Jerome Powell — tall man with grey hair, beard, glasses, serious suit, holding a giant faucet handle",
    panels: `Panel 1: Powell stands at a giant water faucet labeled "MONEY". He turns it OPEN — water (coins) floods out. Happy plants (stocks) grow. "Rate CUT!"
Panel 2: Powell turns the faucet CLOSED — water stops. Plants wilt slightly. Thermometer labeled "Inflation" goes down. "Rate HIKE!" He looks stern.
Panel 3: Powell carefully adjusts the faucet to a gentle drip. Everything balanced — moderate plant growth, cool thermometer. He wipes sweat: "Just right..." Goldilocks appears giving OK sign.`,
  },
  {
    id: "dividend-yield",
    legend: "John D. Rockefeller — old-timey tycoon, top hat, long coat, monocle, stroking a white mustache, sitting in a rocking chair",
    panels: `Panel 1: Rockefeller owns a cute apartment building (price tag "500M"). Tiny happy tenants wave from windows. A mailbox overflows with rent money.
Panel 2: He counts rent income: "20M/year" in neat coin stacks. His monocle sparkles. A calculator shows "20M ÷ 500M = 4%".
Panel 3: Rockefeller rocks in his chair, coins raining from above like gentle snow. "4% every year — just for HOLDING!" He sips tea contentedly. ZZZ money while sleeping.`,
  },
  {
    id: "market-cap",
    legend: "Elon Musk — tall lanky man, messy hair, black t-shirt, mischievous grin, holding a tiny rocket",
    panels: `Panel 1: A giant Samsung Electronics building. Price per brick: "70K". A tiny sign: "6 Billion bricks total". Musk peers up with binoculars.
Panel 2: Musk pulls out a giant calculator: "70K × 6B = 420 TRILLION!" His eyes pop out comically. The number is so big it breaks the calculator screen.
Panel 3: Musk tries to fit the entire building into a shopping cart. It doesn't fit. "That's what Market Cap means — the WHOLE company's price tag!" He shrugs, grinning.`,
  },
  {
    id: "moving-average",
    legend: "Jesse Livermore — dapper 1920s trader, slicked hair, pinstripe suit, holding a bathroom scale",
    panels: `Panel 1: A cute character weighs himself daily — the scale numbers jump wildly: 70, 73, 69, 74, 71. He's confused and dizzy. Livermore watches, amused.
Panel 2: Livermore draws a smooth line through the chaos with a giant red marker: "7-day average = 71.4". The wiggly line becomes a clean trend. "AH HA!"
Panel 3: The smooth line goes UP. Livermore points dramatically: "Uptrend! You're gaining weight, buddy!" The character looks at his belly, shocked. Scale sweats.`,
  },
  {
    id: "short-selling",
    legend: "George Soros — elderly man with large glasses, knowing smirk, dark suit, holding a newspaper with 'Bank of England' headline",
    panels: `Panel 1: Soros borrows a cute game console from a friend. Friend waves bye. Console has a price tag: "500K". Soros has a sly grin and a master plan bubble.
Panel 2: Soros sells it immediately for 500K (coins fly out). Time passes (clock spinning). The console's new price drops to "300K" — sad deflating price tag.
Panel 3: Soros buys it back cheap (300K), returns it to friend. Friend is happy. Soros counts profit: "500K - 300K = 200K PROFIT!" Evil genius laugh. Money confetti.`,
  },
];

// ── API 호출 ──
async function generateImage(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `${res.status}: ${err.slice(0, 200)}` };
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const img = parts.find((p) => p.inlineData);
    return img
      ? { ok: true, imageData: img.inlineData }
      : { ok: false, error: "No image in response" };
  } catch (err) {
    clearTimeout(timeout);
    return { ok: false, error: err.message };
  }
}

// ── main ──
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyIdx = args.indexOf("--only");
  const onlyIds = onlyIdx !== -1 ? args[onlyIdx + 1].split(",") : null;

  const targets = onlyIds ? PROMPTS.filter((p) => onlyIds.includes(p.id)) : PROMPTS;

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`=== Glossary Illustration Generator ===`);
  console.log(`Model: ${MODEL} | Targets: ${targets.length} | Output: ${OUT_DIR}`);
  if (dryRun) { console.log("(DRY RUN — no API calls)"); }

  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const fullPrompt = `3-panel comic strip for a Korean finance education blog (1024x576 landscape).

Character: ${t.legend}

${t.panels}

${STYLE}`;

    console.log(`\n[${i + 1}/${targets.length}] ${t.id}`);

    if (dryRun) {
      console.log(`  Prompt preview: ${fullPrompt.slice(0, 120)}...`);
      results.push({ id: t.id, ok: true, note: "dry-run" });
      continue;
    }

    const start = performance.now();
    const res = await generateImage(fullPrompt);
    const elapsed = Math.round(performance.now() - start);

    if (res.ok) {
      const ext = res.imageData.mimeType === "image/png" ? "png" : "jpg";
      const filename = `${t.id}.${ext}`;
      fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(res.imageData.data, "base64"));
      console.log(`  OK (${elapsed}ms) → ${filename}`);
      results.push({ id: t.id, ok: true, elapsed, filename });
    } else {
      console.log(`  FAIL (${elapsed}ms): ${res.error}`);
      results.push({ id: t.id, ok: false, elapsed, error: res.error });
    }

    // rate limit buffer
    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // summary
  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok);
  console.log(`\n=== Summary: ${ok}/${results.length} OK ===`);
  if (fail.length > 0) {
    console.log("Failed:");
    fail.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
