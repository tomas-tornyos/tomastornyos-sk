/**
 * Centralizované texty pre S1 (02-contracts §1/§3/§4). Jeden zdroj pre obe routy (`/`, `/b`)
 * aj oba typografické varianty — varianty sa líšia IBA sadzbou, nie textom (ADR-0003, kap. 8).
 * Znenie prevzaté doslova z:
 *   ../../../01-content/copy/hero.md
 *   ../../../01-content/copy/o-mne.md
 * Diakritika UTF-8. Neupravovať tu obsah bez zmeny v copy súboroch.
 */

/* ---------- Hero ---------- */

export const HERO = {
  eyebrow: "Rozhodol som sa kandidovať · MsZ Banská Bystrica · Sásová a Rudlová",
  name: "Tomáš Tornyos — architekt",
  team: "Kandidujem v tíme Molitoris.",
  // Status: zatiaľ nie je formálny kandidát — zbiera podpisy (žiadny ONLINE zber, len info).
  signatures:
    "Zatiaľ zbieram podpisy, vďaka ktorým budem môcť podať kandidatúru ako nezávislý poslanec.",
} as const;

/**
 * Testovacie claim kombinácie (K1–K3) pre G1 recall/head-to-head test.
 * NEZAFIXOVANÉ — o víťazovi rozhoduje G1, nie táto session (00-CLAUDE.md must-not).
 */
export const CLAIMS = {
  k1: {
    claim: "Aby sa v Sásovej oplatilo zostať",
    subtitle: "Za Sásovú a Rudlovú. Sľuby, ktoré si viete skontrolovať.",
  },
  k2: {
    claim: "Sásová a Rudlová: pokoj, priestor, poriadok",
    subtitle:
      "Sásová má potenciál. Nezávislý poslanec, ktorý každé rozhodnutie doloží dátami a zverejní.",
  },
  k3: {
    claim: "Sľuby, ktoré si viete skontrolovať",
    subtitle:
      "Nezávislý poslanec pre Sásovú a Rudlovú. Pokoj, priestor, poriadok — doložené dátami.",
  },
} as const;

export type ClaimKey = keyof typeof CLAIMS;

/**
 * Aktívny claim pre TOTO kolo testu. `/` aj `/b` v jednom builde nesú rovnaký claim
 * (tvrdá poistka 02-contracts §3) — rozdiel medzi variantmi je iba typografia.
 * Druhé kolo na iný claim = zmena tejto jednej konštanty.
 */
export const ACTIVE_CLAIM: ClaimKey = "k1";

/**
 * CTA. Cieľové sekcie (Priority, Bystrická minúta) prídu v S2/S3, preto S1 nesmie nechať
 * mŕtve fragmenty (02-contracts §3, 07-codex-review-hardening bod 3). Rozhodnutie:
 * v S1 CTA dočasne smerujú na existujúci `#o-mne`; budúci cieľ je uložený v `futureTarget`
 * (render ho vloží ako `data-future-target`, aby ho S2/S3 vedeli prepnúť).
 */
export const CTA = [
  { label: "Čo chcem presadiť", href: "#o-mne", futureTarget: "#priority", primary: true },
  { label: "Bystrická minúta", href: "#o-mne", futureTarget: "#minuta", primary: false },
] as const;

/* ---------- O mne ---------- */

export const ABOUT = {
  heading: "O mne",

  /** Blok 1 — osobný naratív (Verzia B), Serif. Tri odseky. */
  narrative: [
    "Býval som v Sásovej. Do práce som chodieval na bicykli — po cestách, nebezpečne. Krásna príroda na dosah, ale kam ísť na opekačku? Parkovať som sa naučil ako majster: kamaráti obdivovali moje umenie vtesnať sa do najmenšieho miesta. V kopci. So spiatočkou. A dve z troch svojich detí som kočíkoval práve tu.",
    "Čo sa odvtedy zmenilo? Nie veľa.",
    "Až s odstupom — a s okom architekta — som pochopil, aký dobrý základ Sásová má. Mierka, zeleň medzi domami, výhľady. To sa nedá dostavať. To sa dá len pokaziť. Alebo ustrážiť.",
  ],

  /** Blok 2 — profesijný dôkaz (Verzia A), Sans. */
  proofLead:
    "Architektúre sa venujem dvadsať rokov, z toho osemnásť v Banskej Bystrici, kde som spolu s manželkou Miroslavou založil ateliér Tornyos Architects. Za sebou máme vyše sto projektov doma aj v zahraničí — od horských svahov pri Salzburgu po Zanzibar.",
  proofListIntro: "Tri z nich:",
  proofList: [
    "Rodinný dom, ktorý získal niekoľko profesijných ocenení a bol prezentovaný na medzinárodnom fóre v Aténach.",
    "Bytový dom na stráni v Banskej Bystrici, citlivo zasadený do svahu — aktuálne tesne pred začiatkom realizácie.",
    "Škôlka v obci Viničné, do ktorej nastúpia prvé deti už tento september.",
  ],
  proofCity:
    "Pre mesto som spracoval zmeny a doplnky územného plánu — vrátane výškovej regulácie citlivej k bystrickému kopcovitému charakteru. Presne tú prácu chcem robiť aj ako poslanec.",

  /** Blok 3 — odkaz na architektonickú prácu. */
  link: {
    lead: "Moju architektonickú prácu nájdete na ",
    text: "architt.sk",
    suffix: ".",
    href: "https://www.architt.sk",
  },
} as const;

/* ---------- Pätička — nové položky (rozšírenie S0, všetko DRAFT — S7) ---------- */

export const FOOTER = {
  gdprLabel: "Ochrana osobných údajov",
  gdprHref: "/ochrana-udajov",
  costs: "Náklady kampane zverejníme pred spustením.",
  architect: {
    lead: "Pôsobím ako architekt — moju prácu nájdete na ",
    text: "architt.sk",
    suffix: ".",
    href: "https://www.architt.sk",
  },
} as const;

/* ---------- OG / meta v1 (neutrálne, bez testovacieho claimu) ---------- */

export const OG = {
  title: "Tomáš Tornyos — architekt · Sásová a Rudlová",
  description:
    "Ing. arch. Tomáš Tornyos — architekt. Rozhodol som sa kandidovať za poslanca MsZ Banská Bystrica pre Sásovú a Rudlovú (tím Molitoris).",
  image: "/og/og-default.png",
  width: 1200,
  height: 630,
} as const;
