// @ts-check
import { defineConfig } from 'astro/config';

// Canonical + absolútne OG URL. Cloudflare preview deploye (vetva ≠ main) používajú URL daného
// deployu (CF_PAGES_URL), aby boli og:image a canonical DOSTUPNÉ aj pred spustením produkčnej
// domény (tomastornyos.sk zatiaľ nemá DNS) — inak by FB/WhatsApp náhľad (S1-12) nenačítal obrázok.
// Produkcia (main) a lokálny build = produkčná doména.
const previewUrl =
  process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main'
    ? process.env.CF_PAGES_URL
    : undefined;

// https://astro.build/config
export default defineConfig({
  site: previewUrl || 'https://tomastornyos.sk',
  output: 'static',
});
