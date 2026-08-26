#!/usr/bin/env node
/*
 * Generátor OG obrázka v1 (02-contracts §6, 03-implementation-guide Krok 7).
 * Neutrálny „atrament a papier": meno + profesia + obvod + náznak tímu Molitoris.
 * BEZ testovacieho claimu (K1–K3), bez portrétu, bez gradientov/tieňov.
 *
 * Nepridáva žiadnu npm závislosť: postaví self-contained HTML (self-hosted IBM Plex fonty
 * vložené ako base64 data URI, rovnaké woff2 ako web) a odfotí ho Chrome headless na 1200×630.
 * Výstup: public/og/og-default.png. Jednorazový build asset — nie je súčasťou pnpm gates.
 *
 * Spustenie:  node scripts/build-og-default.mjs
 * Vyžaduje:   Google Chrome (headless --screenshot).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const fontsDir = join(root, "public", "fonts");
const outDir = join(root, "public", "og");
const outPng = join(outDir, "og-default.png");

const CHROME =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function fontDataUri(file) {
  const buf = await readFile(join(fontsDir, file));
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

// Rovnaké subsety (latin + latin-ext) ako fonts.css — kvôli SK diakritike (š, á, …).
const [sans400, sans400ext, sans600, sans600ext, mono400, mono400ext] = await Promise.all([
  fontDataUri("ibm-plex-sans-latin-400-normal.woff2"),
  fontDataUri("ibm-plex-sans-latin-ext-400-normal.woff2"),
  fontDataUri("ibm-plex-sans-latin-600-normal.woff2"),
  fontDataUri("ibm-plex-sans-latin-ext-600-normal.woff2"),
  fontDataUri("ibm-plex-mono-latin-400-normal.woff2"),
  fontDataUri("ibm-plex-mono-latin-ext-400-normal.woff2"),
]);

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2122,U+2212";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+2C60-2C7F,U+A720-A7FF";

const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"/>
<style>
  @font-face{font-family:"IBM Plex Sans";font-weight:400;src:url(${sans400}) format("woff2");unicode-range:${LATIN}}
  @font-face{font-family:"IBM Plex Sans";font-weight:400;src:url(${sans400ext}) format("woff2");unicode-range:${LATIN_EXT}}
  @font-face{font-family:"IBM Plex Sans";font-weight:600;src:url(${sans600}) format("woff2");unicode-range:${LATIN}}
  @font-face{font-family:"IBM Plex Sans";font-weight:600;src:url(${sans600ext}) format("woff2");unicode-range:${LATIN_EXT}}
  @font-face{font-family:"IBM Plex Mono";font-weight:400;src:url(${mono400}) format("woff2");unicode-range:${LATIN}}
  @font-face{font-family:"IBM Plex Mono";font-weight:400;src:url(${mono400ext}) format("woff2");unicode-range:${LATIN_EXT}}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px}
  body{
    background:#FAF8F3;color:#25303B;
    font-family:"IBM Plex Sans",sans-serif;
    display:flex;flex-direction:column;justify-content:center;
    padding:96px 104px;
  }
  .eyebrow{
    font-family:"IBM Plex Mono",monospace;font-size:24px;font-weight:400;
    letter-spacing:.14em;text-transform:uppercase;color:#5A6673;
  }
  .name{
    font-weight:600;font-size:104px;line-height:1.02;color:#1C3A5E;
    margin-top:40px;
  }
  .accent{width:132px;height:6px;background:#D9932B;margin-top:36px;margin-bottom:36px}
  .meta{font-size:38px;line-height:1.35;color:#25303B}
  .meta .prof{color:#1C3A5E;font-weight:600}
  .team{font-size:30px;color:#5A6673;margin-top:14px}
</style></head>
<body>
  <div class="eyebrow">Rozhodol som sa kandidovať · MsZ Banská Bystrica</div>
  <div class="name">Tomáš Tornyos</div>
  <div class="accent"></div>
  <div class="meta"><span class="prof">architekt</span> · Sásová a Rudlová</div>
  <div class="team">tím Molitoris</div>
</body></html>`;

const tmpHtml = join(tmpdir(), "og-default-source.html");
await writeFile(tmpHtml, html, "utf8");
await mkdir(outDir, { recursive: true });

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--default-background-color=00000000",
    "--window-size=1200,630",
    `--screenshot=${outPng}`,
    `file://${tmpHtml}`,
  ],
  { stdio: "inherit" },
);

console.log(`✓ OG obrázok vygenerovaný: ${outPng}`);
