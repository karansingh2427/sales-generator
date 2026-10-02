import type { HubSpotConfig, HubSpotPropertyMap, HubSpotStageMap, LeadStage } from "@/types/sales";

/**
 * Configurable HubSpot stage labels → internal stages.
 * Floor/ops can override via HUBSPOT_STAGE_MAP JSON env (label:stage pairs).
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
  customer: "demo_booked",
  evangelist: "demo_booked",
  other: "disqualified",
  unqualified: "disqualified",
};

/**
 * Property names for lead-gen agent fields on HubSpot contacts.
 * Override with HUBSPOT_PROPERTY_MAP JSON env when Floor confirms schema.
 */
export const DEFAULT_PROPERTY_MAP: HubSpotPropertyMap = {
  whyGood: "sg_why_good",
  opener: "sg_opener",
  rightContact: "sg_right_contact",
  socialPresence: "sg_social_presence",
  vertical: "sg_vertical",
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
