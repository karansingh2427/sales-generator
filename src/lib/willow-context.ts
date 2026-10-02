/** Product copy and ICP defaults for Floor Hoefkens / Willow BDR workflow. */
export const WILLOW_PITCH = {
  headline: "Always know what to post — without burning partner time.",
  valueProps: [
    "200+ law firms on Willow; content in the firm's voice, not generic AI slop.",
    "Quarterly calendars + coach — consistency beats sporadic posting.",
    "EU hosting and GDPR by default — matters for regulated firms.",
  ],
  demoCta: "30-minute live demo: we draft posts for their firm on the call.",
} as const;

/** Willow’s book is BE + NL first (Benelux / nearby EU secondary). */
export const ICP_GEOGRAPHY = {
  primaryMarkets: "Belgium & the Netherlands",
  defaultFilterLabel: "BE + NL",
  description:
    "Most Willow clients are in Belgium and the Netherlands. Sales Nav imports default to BE+NL geo filter; nearby EU is scored lower unless Floor expands the filter.",
} as const;

export const DEFAULT_AES = [
  "Sarah Chen",
  "Marcus Webb",
  "Elena Kostova",
] as const;

export const PRACTICE_AREAS = [
  "Corporate / M&A",
  "Litigation",
  "Employment",
  "Real estate",
  "Family",
  "IP / Tech",
  "General practice",
] as const;
