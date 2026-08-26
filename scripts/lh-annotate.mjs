#!/usr/bin/env node
/*
 * Diagnostika: prečíta LHR reporty z .lighthouseci a vypíše medián Perf/A11y/BP na route
 * ako GitHub Actions `::warning::` anotácie (čitateľné aj bez admin práv na repo).
 * Pomocný krok pri ladení CI — nie je to brána (bránou ostáva `lhci assert`).
 */
import { readdirSync, readFileSync } from "node:fs";

const dir = ".lighthouseci";
let files = [];
try {
  files = readdirSync(dir).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"));
} catch {
  console.log("::warning::lh-annotate: nenašiel som .lighthouseci LHR reporty");
  process.exit(0);
}

const byUrl = {};
for (const f of files) {
  let j;
  try {
    j = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
  } catch {
    continue;
  }
  const url = new URL(j.finalUrl || j.finalDisplayedUrl || j.requestedUrl).pathname;
  const pick = (c) => (j.categories?.[c] ? Math.round(j.categories[c].score * 100) : null);
  (byUrl[url] ||= []).push({ perf: pick("performance"), a11y: pick("accessibility"), bp: pick("best-practices") });
}

const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const url of Object.keys(byUrl).sort()) {
  const runs = byUrl[url];
  const perf = median(runs.map((r) => r.perf));
  const a11y = median(runs.map((r) => r.a11y));
  const bp = median(runs.map((r) => r.bp));
  console.log(
    `::warning title=Lighthouse ${url}::Perf ${perf} | A11y ${a11y} | BP ${bp} ` +
      `(runs Perf: ${runs.map((r) => r.perf).join("/")})`,
  );
}
