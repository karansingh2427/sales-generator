import type { Lead } from "@/types/sales";
import {
  describeAngles,
  inferOpportunityAngles,
  type OpportunityAngle,
} from "@/lib/icp";

/**
 * One thread only. Pick a single primary angle from the HubSpot note —
 * never stack unrelated product angles (vacancy → content calendar is invalid).
 */
export const STORY_ANGLE_PRIORITY: OpportunityAngle[] = [
  "open_vacancies",
  "visibility",
  "consistency",
  "content_quality",
  "content_mix",
];

export type StoryArc = {
  angle: OpportunityAngle;
  insight: string;
  tension: string;
  willowBridge: string;
  subjectHint: string;
};

const TENSION: Record<OpportunityAngle, (firm: string) => string> = {
  open_vacancies: (firm) =>
    `When ${firm} is hiring, candidates and clients often check LinkedIn first — the employer brand story around open roles matters as much as the vacancy post itself.`,
  visibility: (firm) =>
    `If ${firm}’s expertise barely shows online, the buyers you want may never see why you’re the safer choice.`,
  consistency: (firm) =>
    `When ${firm} hasn’t been posting consistently, the firm can look quieter than peers online — even when the work is strong.`,
  content_quality: (firm) =>
    `Generic or thin posts don’t sound like ${firm} — decision makers notice when the voice doesn’t match the expertise.`,
  content_mix: (firm) =>
    `Promo-only feeds leave little room for the judgment ${firm} is actually known for.`,
};

/** Soft Willow bridge — continues the SAME story. No feature dump. */
const WILLOW_BRIDGE: Record<OpportunityAngle, string> = {
  open_vacancies:
    "Willow helps expertise firms stay visible in their own voice while hiring — without pulling partners into content production.",
  visibility:
    "Willow helps expertise firms make that expertise findable online, in the firm’s voice, without burning expert time.",
  consistency:
    "Willow helps expertise firms post steadily in their own voice — without partners writing every piece.",
  content_quality:
    "Willow drafts in the firm’s voice so what goes out sounds like the people who do the work.",
  content_mix:
    "Willow helps expertise firms balance useful POV with offers — still in the firm’s voice.",
};

const SUBJECT: Record<OpportunityAngle, (firm: string) => string> = {
  open_vacancies: (firm) => `${firm} — hiring visibility`,
  visibility: (firm) => `${firm} — online visibility`,
  consistency: (firm) => `${firm} — LinkedIn consistency`,
  content_quality: (firm) => `${firm} — firm voice online`,
  content_mix: (firm) => `${firm} — how you show up online`,
};

/** Prefer vacancy/hiring/visibility signals over generic content angles. */
export function pickPrimaryAngle(angles: OpportunityAngle[]): OpportunityAngle {
  for (const a of STORY_ANGLE_PRIORITY) {
    if (angles.includes(a)) return a;
  }
  return angles[0] ?? "visibility";
}

function insightFromNote(lead: Lead, angle: OpportunityAngle): string {
  const opener = lead.crm?.opener?.trim();
  if (opener) {
    // Strip product-pitch / calendar pivots. Prefer consistency phrasing
    // ("haven't been posting consistently") over pointing at a single post date.
    let cleaned = opener
      .replace(/\bwillow\b[^.?!]*/gi, "")
      .replace(/\b(quarterly\s+)?content\s+calendar(s)?\b/gi, "")
      .replace(/\bi saw (your|the) post (yesterday|friday|today|this week)\b/gi, "I see you haven’t been posting consistently")
      .replace(/\bnothing happening on linkedin\b/gi, "you haven’t been posting consistently")
      .replace(/\s{2,}/g, " ")
      .replace(/\s*[—–-]\s*$/g, "")
      .trim();
    if (cleaned.length > 12) return cleaned;
  }
  const why = lead.crm?.whyGood?.trim();
  if (why) return why;
  if (angle === "consistency") {
    return "I see you haven’t been posting consistently on LinkedIn";
  }
  return describeAngles([angle])[0] ?? "room to show expertise more clearly online";
}

export function buildStoryArc(lead: Lead): StoryArc {
  const angles = inferOpportunityAngles(lead);
  const angle = pickPrimaryAngle(angles);
  return {
    angle,
    insight: insightFromNote(lead, angle),
    tension: TENSION[angle](lead.firmName),
    willowBridge: WILLOW_BRIDGE[angle],
    subjectHint: SUBJECT[angle](lead.firmName),
  };
}

/** Words that signal a random product pivot — must not appear when story is hiring/vacancy. */
export const FORBIDDEN_PIVOT_WHEN_VACANCY = [
  "content calendar",
  "quarterly calendar",
  "calendars + coach",
  "feature dump",
];

export function storyUsesVacancy(arc: StoryArc): boolean {
  return arc.angle === "open_vacancies";
}
