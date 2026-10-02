import type { ExpertiseVertical, Lead, SocialPresenceSignal } from "@/types/sales";
import { detectGeoCode } from "@/lib/geo";

/** Decision-maker title patterns by vertical (Floor ICP). */
const DECISION_MAKER_PATTERNS: { vertical: ExpertiseVertical | "any"; patterns: RegExp[] }[] = [
  { vertical: "legal", patterns: [/\bpartner\b/i, /\bmanaging partner\b/i, /\bassoci[eé]e?\b/i] },
  { vertical: "it", patterns: [/\bfounder\b/i, /\bco-?founder\b/i, /\bceo\b/i, /\bcto\b/i] },
  {
    vertical: "any",
    patterns: [
      /\boperations?\s+manager\b/i,
      /\bops\s+manager\b/i,
      /\bcoo\b/i,
      /\bmanaging director\b/i,
      /\bowner\b/i,
      /\bfounder\b/i,
      /\bpartner\b/i,
    ],
  },
];

const VERTICAL_KEYWORDS: { vertical: ExpertiseVertical; patterns: RegExp[] }[] = [
  {
    vertical: "legal",
    patterns: [
      /\blaw\b/i,
      /\blegal\b/i,
      /\blitigation\b/i,
      /\badvocat/i,
      /\bavocat/i,
      /\brechtsanwalt/i,
      /\blawyer/i,
      /\battorney/i,
    ],
  },
  {
    vertical: "accountancy",
    patterns: [/\baccountan/i, /\baudit\b/i, /\bcpa\b/i, /\bbookkeep/i, /\bfiscal\b/i],
  },
  {
    vertical: "it",
    patterns: [/\bsoftware\b/i, /\bIT\b/, /\bsaas\b/i, /\btech\b/i, /\bdigital\b/i],
  },
  {
    vertical: "hr_recruitment",
    patterns: [
      /\brecruit/i,
      /\bexecutive search\b/i,
      /\bHR\b/,
      /\bhuman resources\b/i,
      /\bstaffing\b/i,
      /\btalent\b/i,
    ],
  },
  {
    vertical: "coaching",
    patterns: [/\bcoach/i, /\bconsultancy\b/i, /\bconsulting\b/i, /\bexpertise\b/i],
  },
];

export const OPPORTUNITY_ANGLES = [
  "consistency",
  "content_quality",
  "content_mix",
  "visibility",
  "open_vacancies",
] as const;

export type OpportunityAngle = (typeof OPPORTUNITY_ANGLES)[number];

const ANGLE_COPY: Record<OpportunityAngle, string> = {
  consistency: "posting consistency gap — sporadic or stalled LinkedIn cadence",
  content_quality: "content quality — firm voice vs generic / thin posts",
  content_mix: "content mix — missing thought-leadership vs pure promo",
  visibility: "network visibility — expertise not reaching buyers online",
  open_vacancies: "open vacancies online without company storytelling",
};

export function detectVertical(
  firmName: string,
  practiceArea: string,
  industry?: string,
): ExpertiseVertical {
  const hay = `${firmName} ${practiceArea} ${industry ?? ""}`;
  for (const { vertical, patterns } of VERTICAL_KEYWORDS) {
    if (patterns.some((p) => p.test(hay))) return vertical;
  }
  if (/professional|expertise|b2b|advisory/i.test(hay)) return "expertise_b2b";
  return "other";
}

export function isDecisionMaker(title: string, vertical?: ExpertiseVertical): boolean {
  if (!title?.trim()) return false;
  const specific = DECISION_MAKER_PATTERNS.filter(
    (d) => d.vertical === vertical || d.vertical === "any",
  );
  return specific.some((d) => d.patterns.some((p) => p.test(title)));
}

export function parseSocialPresence(raw?: string | null): SocialPresenceSignal {
  if (!raw?.trim()) return "unknown";
  const t = raw.toLowerCase();
  if (/\b(strong|excellent|very good|active|polished)\b/.test(t)) return "strong";
  if (/\b(inconsistent|sporadic|irregular|uneven)\b/.test(t)) return "inconsistent";
  if (/\b(weak|poor|inactive|gap|missing|none|thin)\b/.test(t)) return "weak";
  return "unknown";
}

export function inferOpportunityAngles(lead: Pick<Lead, "notes" | "crm" | "socialPresence">): OpportunityAngle[] {
  const hay = `${lead.notes ?? ""} ${lead.crm?.whyGood ?? ""} ${lead.crm?.opener ?? ""} ${lead.crm?.rawNote ?? ""}`.toLowerCase();
  const angles: OpportunityAngle[] = [];
  if (/consist|cadence|post.*week|inactive|stalled/.test(hay) || lead.socialPresence === "inconsistent")
    angles.push("consistency");
  if (/quality|thin|generic|voice|slop/.test(hay)) angles.push("content_quality");
  if (/mix|thought.?lead|promo only|variety/.test(hay)) angles.push("content_mix");
  if (/visib|reach|network|buyer|prospect/.test(hay)) angles.push("visibility");
  if (/vacanc|hiring|job.?post|open role|recruit/.test(hay)) angles.push("open_vacancies");
  if (angles.length === 0) {
    if (lead.socialPresence === "weak" || lead.socialPresence === "inconsistent") {
      angles.push("consistency", "visibility");
    } else {
      angles.push("consistency", "content_quality");
    }
  }
  return angles;
}

export function describeAngles(angles: OpportunityAngle[]): string[] {
  return angles.map((a) => ANGLE_COPY[a]);
}

/**
 * Floor ICP: decision makers in expertise B2B verticals,
 * Belgium-first then Netherlands only, skip strong social presence.
 */
export function scoreExpertiseIcp(input: {
  title: string;
  firmName: string;
  practiceArea: string;
  location: string;
  firmSize?: string;
  socialPresence?: SocialPresenceSignal;
  vertical?: ExpertiseVertical;
  industry?: string;
}): { score: number; vertical: ExpertiseVertical; geoCode?: string; disqualify: boolean; reasons: string[] } {
  const vertical = input.vertical ?? detectVertical(input.firmName, input.practiceArea, input.industry);
  const geoCode = detectGeoCode(input.location);
  const reasons: string[] = [];
  let score = 55;

  const expertiseVerticals: ExpertiseVertical[] = [
    "legal",
    "accountancy",
    "it",
    "hr_recruitment",
    "coaching",
    "expertise_b2b",
  ];
  if (expertiseVerticals.includes(vertical)) {
    score += 18;
    reasons.push(`Expertise vertical: ${vertical}`);
  } else {
    score -= 8;
    reasons.push("Outside core expertise-B2B verticals");
  }

  if (isDecisionMaker(input.title, vertical)) {
    score += 16;
    reasons.push(`Decision-maker title: ${input.title}`);
  } else {
    score -= 12;
    reasons.push("Title may not be decision maker (Partner / Founder / Ops manager preferred)");
  }

  if (geoCode === "BE") {
    score += 16;
    reasons.push("Belgium — primary ICP market");
  } else if (geoCode === "NL") {
    score += 12;
    reasons.push("Netherlands — secondary ICP market");
  } else {
    score -= 20;
    reasons.push("Out of scope — BE + NL only");
  }

  const presence = input.socialPresence ?? "unknown";
  let disqualify = false;
  if (presence === "strong") {
    score = Math.min(score, 45);
    disqualify = true;
    reasons.push("Strong social presence — Floor disqualifier (skip)");
  } else if (presence === "weak") {
    score += 10;
    reasons.push("Weak social presence — pursue");
  } else if (presence === "inconsistent") {
    score += 8;
    reasons.push("Inconsistent presence — pursue");
  }

  if (input.firmSize && /1–5|1-5|solo/i.test(input.firmSize)) {
    score -= 10;
    reasons.push("Very small firm — lower priority");
  }

  score = Math.max(0, Math.min(99, score));
  return { score, vertical, geoCode, disqualify, reasons };
}
