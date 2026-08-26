#!/usr/bin/env node
/*
 * S1 dist hardening gate (03-implementation-guide Krok 1, 05-verification S1-10/11/13/17/18/21).
 * Beží PO `pnpm build` nad `dist/`. Overuje staticky všetko, čo sa dá:
 *  - stránky `/`, `/ochrana-udajov`, `404.html` existujú (routa `/b` odstránená — variant A je definitíva);
 *    noindex/tracking/JS kontroly bežia na všetkých troch;
 *  - všetky interné `href="#..."` majú existujúci `id` na tej istej stránke;
 *  - `robots: noindex` je na všetkých HTML;
 *  - žiadny externý font request ani analytics/cookies skript;
 *  - žiadny klient-side JS pre A/B (žiadne obsahové islands) — technický Astro script sa vypíše na odsúhlasenie;
 *  - OG/meta: og:title, og:description, absolútna og:image (1200×630), twitter:card; OG súbor existuje;
 *  - OG v1 NEOBSAHUJE žiadny testovací claim K1–K3.
 * Non-zero exit pri akejkoľvek chybe.
 */
import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readHtml(rel) {
  const p = join(dist, rel);
  if (!(await exists(p))) {
    fail(`Chýba vygenerovaná stránka: dist/${rel}`);
    return null;
  }
  return readFile(p, "utf8");
}

// --- Testovacie claimy, ktoré OG v1 NESMIE obsahovať (zdroj: 02-contracts §3) ---
const CLAIMS_K1_K3 = [
  "Aby sa v Sásovej oplatilo zostať",
  "Sásová a Rudlová: pokoj, priestor, poriadok",
  "Sľuby, ktoré si viete skontrolovať",
];

// --- Zakázané externé/tracking vzory (03-implementation-guide Krok 1.2) ---
const FORBIDDEN_PATTERNS = [
  "fonts.googleapis",
  "fonts.gstatic",
  "plausible",
  "umami",
  "gtag",
  "googletagmanager",
  "connect.facebook",
  "facebook.net",
  "hotjar",
];

// Zbierka href="#..." fragmentov a id="..." na stránke.
function collectFragments(html) {
  const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  return { hrefs, ids };
}

async function main() {
  // 1) Routy existujú (S1-1, S1-3).
  const pages = {
    index: await readHtml("index.html"),
    gdpr: await readHtml("ochrana-udajov/index.html"),
    notfound: await readHtml("404.html"),
  };

  const allHtml = Object.entries(pages).filter(([, v]) => v);

  // 2) noindex na všetkých HTML (S1-18).
  for (const [name, html] of allHtml) {
    if (!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex[^"]*"/i.test(html)) {
      fail(`Stránka ${name}: chýba <meta name="robots" content="noindex">`);
    }
  }

  // 3) Žiadne externé fonty / analytics / cookies (S1-13, S1-17).
  for (const [name, html] of allHtml) {
    for (const pat of FORBIDDEN_PATTERNS) {
      if (html.includes(pat)) {
        fail(`Stránka ${name}: zakázaný externý/tracking odkaz „${pat}".`);
      }
    }
  }

  // 4) Žiadny klient-side JS pre obsah / žiadne islands (S1-21, must-not). Astro pri čisto
  //    statickom builde nevkladá <script>; akýkoľvek ne-JSON skript je porušenie brány (fail),
  //    nie len upozornenie. Povolené sú iba dátové bloky (JSON-LD / JSON), ktoré nič nevykonávajú.
  for (const [name, html] of allHtml) {
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    for (const s of scripts) {
      const attrs = s[1];
      const isDataOnly = /type="application\/(ld\+json|json)"/i.test(attrs);
      if (isDataOnly) continue;
      fail(`Stránka ${name}: nájdený klient-side <script${attrs}> — porušuje must-not „žiadne islands/JS" (S1-21).`);
    }
  }

  // 5) Hero blok existuje na `/` (S1-1). Data marker pre budúce sekcie/kontroly.
  if (pages.index && !/<section[^>]*data-hero[^>]*>/i.test(pages.index)) {
    fail("Nenašiel sa hero blok s atribútom data-hero na `/`.");
  }

  // 6) Interné fragmenty nie sú mŕtve (S1-4). Každý href="#x" má id="x" na tej istej stránke.
  for (const [name, html] of allHtml) {
    const { hrefs, ids } = collectFragments(html);
    for (const frag of hrefs) {
      if (!ids.has(frag)) {
        fail(`Stránka ${name}: mŕtvy interný odkaz href="#${frag}" — chýba id="${frag}".`);
      }
    }
  }

  // 7) OG/Twitter meta na `/` (S1-10, S1-11). Absolútna og:image 1200×630, súbor existuje.
  for (const [name, html] of [["index", pages.index]]) {
    if (!html) continue;
    const need = [
      [/<meta[^>]+property="og:title"[^>]+content="[^"]+"/i, "og:title"],
      [/<meta[^>]+property="og:description"[^>]+content="[^"]+"/i, "og:description"],
      [/<meta[^>]+name="twitter:card"[^>]+content="summary_large_image"/i, "twitter:card=summary_large_image"],
      [/<meta[^>]+property="og:image:width"[^>]+content="1200"/i, "og:image:width=1200"],
      [/<meta[^>]+property="og:image:height"[^>]+content="630"/i, "og:image:height=630"],
    ];
    for (const [re, label] of need) {
      if (!re.test(html)) fail(`Stránka ${name}: chýba/neplatné meta ${label}.`);
    }
    const ogImg = (html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || [])[1];
    if (!ogImg) {
      fail(`Stránka ${name}: chýba og:image.`);
    } else if (!/^https?:\/\//i.test(ogImg)) {
      fail(`Stránka ${name}: og:image nie je absolútna URL: ${ogImg}`);
    }
    // OG v1 nesmie niesť testovací claim.
    for (const claim of CLAIMS_K1_K3) {
      const ogTitle = (html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i) || [])[1] || "";
      const ogDesc = (html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i) || [])[1] || "";
      if (ogTitle.includes(claim) || ogDesc.includes(claim)) {
        fail(`Stránka ${name}: OG v1 obsahuje testovací claim „${claim}" — musí byť neutrálny (bez K1–K3).`);
      }
    }
  }

  // 8) OG obrázok existuje v dist/og/ (S1-11).
  if (!(await exists(join(dist, "og", "og-default.png")))) {
    fail("Chýba OG obrázok: dist/og/og-default.png");
  }

  // --- Report ---
  for (const w of warnings) console.warn(`⚠ ${w}`);
  if (errors.length) {
    console.error(`\n✗ check:s1 — ${errors.length} chýb:`);
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }
  console.log("✓ check:s1 — routy, hero blok, fragmenty, noindex, OG/meta, žiadne externé/tracking/JS — OK");
}

await main();
