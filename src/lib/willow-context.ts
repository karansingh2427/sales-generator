/** Product copy and ICP defaults for Floor Hoefkens / Willow BDR workflow. */
export const WILLOW_PITCH = {
  headline: "Always know what to post — without burning expert time.",
  valueProps: [
    "Expertise firms on Willow; content in the firm's voice, not generic AI slop.",
    "Quarterly calendars + coach — consistency beats sporadic posting.",
    "EU hosting and GDPR by default — matters for regulated & professional services.",
  ],
  /** Booking CTA assumes per-AE calendar links (Floor’s manual flow) — not a shared Calendly. */
  demoCta:
    "Book a 30-minute live demo on the AE’s calendar link (we draft posts for their firm on the call).",
} as const;

/** Belgium first, Netherlands second — BE + NL only (hard product rule). */
export const ICP_GEOGRAPHY = {
  primaryMarkets: "Belgium (primary) · Netherlands (secondary)",
  defaultFilterLabel: "BE + NL",
  description:
    "ICP geography is locked to Belgium first and the Netherlands second. HubSpot pulls and Sales Nav imports default to BE + NL; every other country is out of scope.",
} as const;

/**
 * AE roster with per-AE calendar booking URLs.
 * Same mechanism Floor uses today when she cold-calls then pastes an AE link —
 * not a single shared Calendly until ops says otherwise.
 */
export type AeRosterEntry = {
  name: string;
  /** Manual per-AE calendar booking URL (placeholder until Floor supplies real links). */
  calendarUrl: string;
};

export const DEFAULT_AES: AeRosterEntry[] = [
  {
    name: "Sarah Chen",
    calendarUrl: "https://calendar.willow.co/ae/sarah-chen",
  },
  {
    name: "Marcus Webb",
    calendarUrl: "https://calendar.willow.co/ae/marcus-webb",
  },
  {
    name: "Elena Kostova",
    calendarUrl: "https://calendar.willow.co/ae/elena-kostova",
  },
];

export function aeNames(): string[] {
  return DEFAULT_AES.map((a) => a.name);
}

export function calendarUrlForAe(name: string): string | undefined {
  return DEFAULT_AES.find((a) => a.name === name)?.calendarUrl;
}

/** Practice / vertical labels shown in demo generator (broader than law-only). */
export const PRACTICE_AREAS = [
  "Corporate / M&A",
  "Litigation",
  "Employment",
  "Accountancy",
  "IT / SaaS",
  "HR / Executive search",
  "Coaching / Advisory",
  "Real estate",
  "IP / Tech",
  "General practice",
] as const;

/**
 * CRM language rule (Floor confirmed): anything written into HubSpot stays English.
 * Outreach drafts may be edited in any language before send.
 */
export const CRM_LANGUAGE = "en" as const;
