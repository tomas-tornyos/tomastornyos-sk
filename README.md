# tomastornyos.sk

Mobile-first landing page nezávislého kandidáta na poslanca MsZ Banská Bystrica
(Ing. arch. Tomáš Tornyos, obvod Sásová/Rudlová, tím Molitoris, voľby 24. 10. 2026).

Stack: **Astro** (statické HTML, interaktivita len ako izolované islands), vizuál
„atrament a papier". Zdroj pravdy: `../00-ssot/zadanie-web-kandidata-v2-0.md`.

> **Stav: S0 (skeleton + pipeline).** Web je zámerne v režime „pripravujeme"
> s `<meta name="robots" content="noindex">`. Žiadny finálny obsah, žiadna
> analytika/cookies. `noindex` sa odstráni pri launchi v1.0 (S2 → produkcia).

## Vývoj

Package manager je **pnpm** (`pnpm-lock.yaml` je verzovaný). Node **22+**.

| Príkaz | Akcia |
| :-- | :-- |
| `pnpm install` | Inštalácia závislostí |
| `pnpm dev` | Dev server na `localhost:4321` |
| `pnpm build` | Produkčný build do `./dist/` |
| `pnpm preview` | Lokálny náhľad buildu |
| `pnpm check` | `astro check` + validácia sľubníka |
| `pnpm validate:promises` | Validácia `src/data/promises.json` voči schéme |

## Sľubník (dátový kontrakt)

`src/data/promises.schema.json` (JSON Schema 2020-12) + `src/data/promises.json`
(zatiaľ prázdny, validný). „Git ako notár" — každá zmena statusu = commit s
verejnou históriou. Render je až S5; v S0 existuje len schéma + prázdny JSON +
validátor (`scripts/validate-promises.mjs`, CI gate). Viď `ADR-0002`.

## Fonty

IBM Plex (Sans/Serif/Mono) sú **self-hosted** v `public/fonts/` ako woff2 subsety
(latin + latin-ext, SK diakritika). Žiadny Google Fonts request. Licencia písma:
SIL Open Font License 1.1 (`public/fonts/LICENSE-fonts.txt`).

## Nasadenie — Cloudflare Pages

1. Prepoj repozitár s Cloudflare Pages (framework preset **Astro**).
2. Build command: `pnpm build` · Output directory: `dist` · Production branch: `main`.
3. Nastav env `NODE_VERSION=22` (repo vyžaduje Node ≥ 22.12; default CF je nižší).
4. Cloudflare auto-detekuje `pnpm-lock.yaml` → inštaluje cez pnpm.
5. Každý push do `main` = deploy; PR = preview URL. Fallback doména: `*.pages.dev`
   (custom doména tomastornyos.sk cez Cloudflare, úloha 12.2).

Functions/KV (anketa) sa v S0 **nezavádzajú** — prídu v S3.

## Kontrola kvality (gates)

`.github/workflows/ci.yml` a `lighthouserc.json`: build, `pnpm check`, kontrola
absencie externých fontov, Lighthouse (mobile) s prahmi **Perf ≥ 0.95, A11y ≥ 0.95**.
