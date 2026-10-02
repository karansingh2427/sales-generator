import type { HubSpotConfig, HubSpotPropertyMap, HubSpotStageMap, LeadStage } from "@/types/sales";

/**
 * Configurable HubSpot stage labels → internal stages.
 * Floor confirmed post–Demo Booked: Demo Completed | Rescheduled | Cancelled.
 * Pre–Demo Booked labels still TBD from ops — override via HUBSPOT_STAGE_MAP.
 */
export const DEFAULT_STAGE_MAP: HubSpotStageMap = {
  lead: "new",
  "new lead": "new",
  subscriber: "new",
  marketingqualifiedlead: "qualified",
  "marketing qualified lead": "qualified",
  salesqualifiedlead: "qualified",
  "sales qualified lead": "qualified",
  opportunity: "outreach_drafted",
  "in progress": "contacted",
  contacted: "contacted",
  "demo booked": "demo_booked",
  "appointment scheduled": "demo_booked",
  "demo completed": "demo_completed",
  "demo_completed": "demo_completed",
  completed: "demo_completed",
  "demo rescheduled": "demo_rescheduled",
  "demo_rescheduled": "demo_rescheduled",
  rescheduled: "demo_rescheduled",
  "demo cancelled": "demo_cancelled",
  "demo_cancelled": "demo_cancelled",
  cancelled: "demo_cancelled",
  canceled: "demo_cancelled",
  customer: "demo_completed",
  evangelist: "demo_completed",
  other: "disqualified",
  unqualified: "disqualified",
};

/**
 * Optional structured properties for agent fields.
 * Floor’s handoff is primarily a **company-level HubSpot note** (why / opener / right contact).
 * Property names below are fallbacks when ops also sets custom props on Company (preferred)
 * or Contact — not a contact-only model.
 */
export const DEFAULT_PROPERTY_MAP: HubSpotPropertyMap = {
  whyGood: "sg_why_good",
  opener: "sg_opener",
  rightContact: "sg_right_contact",
  socialPresence: "sg_social_presence",
  vertical: "sg_vertical",
};

/** Human-readable stage labels for UI / HubSpot English writebacks. */
export const STAGE_UI_LABELS: Record<LeadStage, string> = {
  new: "New",
  qualified: "Qualified",
  outreach_drafted: "Draft ready",
  contacted: "Contacted",
  replied: "Replied",
  demo_booked: "Demo booked",
  demo_completed: "Demo completed",
  demo_rescheduled: "Demo rescheduled",
  demo_cancelled: "Demo cancelled",
  disqualified: "Disqualified",
};

/** English HubSpot lifecycle/deal labels used when pushing stages (CRM stays English). */
export const HUBSPOT_ENGLISH_STAGE_LABELS: Record<LeadStage, string> = {
  new: "lead",
  qualified: "marketingqualifiedlead",
  outreach_drafted: "opportunity",
  contacted: "opportunity",
  replied: "opportunity",
  demo_booked: "Demo Booked",
  demo_completed: "Demo Completed",
  demo_rescheduled: "Demo Rescheduled",
  demo_cancelled: "Demo Cancelled",
  disqualified: "other",
};

export function parseStageMap(raw: string | undefined): HubSpotStageMap {
  if (!raw?.trim()) return { ...DEFAULT_STAGE_MAP };
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: HubSpotStageMap = { ...DEFAULT_STAGE_MAP };
    for (const [k, v] of Object.entries(parsed)) {
      out[k.toLowerCase().trim()] = v as LeadStage;
    }
    return out;
  } catch {
    return { ...DEFAULT_STAGE_MAP };
  }
}

export function parsePropertyMap(raw: string | undefined): HubSpotPropertyMap {
  if (!raw?.trim()) return { ...DEFAULT_PROPERTY_MAP };
  try {
    const parsed = JSON.parse(raw) as Partial<HubSpotPropertyMap>;
    return { ...DEFAULT_PROPERTY_MAP, ...parsed };
  } catch {
    return { ...DEFAULT_PROPERTY_MAP };
  }
}

export function resolveHubSpotMode(token?: string | null): "mock" | "live" {
  return token && token.trim().length > 0 ? "live" : "mock";
}

export function defaultHubSpotConfig(): HubSpotConfig {
  return {
    mode: resolveHubSpotMode(process.env.HUBSPOT_ACCESS_TOKEN),
    stageMap: parseStageMap(process.env.HUBSPOT_STAGE_MAP),
    propertyMap: parsePropertyMap(process.env.HUBSPOT_PROPERTY_MAP),
  };
}

export function mapHubSpotStage(
  label: string | undefined,
  stageMap: HubSpotStageMap = DEFAULT_STAGE_MAP,
): LeadStage {
  if (!label) return "new";
  const key = label.toLowerCase().trim();
  return stageMap[key] ?? "new";
}
