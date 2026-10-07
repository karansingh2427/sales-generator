import type {
  CrmAgentContext,
  ExpertiseVertical,
  HubSpotPropertyMap,
  HubSpotStageMap,
  Lead,
  LeadStage,
  SocialPresenceSignal,
} from "@/types/sales";
import {
  DEFAULT_PROPERTY_MAP,
  DEFAULT_STAGE_MAP,
  HUBSPOT_ENGLISH_STAGE_LABELS,
  mapHubSpotStage,
  resolveHubSpotMode,
} from "@/lib/hubspot-config";
import { parseSocialPresence, scoreExpertiseIcp } from "@/lib/icp";
import { detectGeoCode } from "@/lib/geo";

export type HubSpotSyncResult = {
  mode: "mock" | "live";
  contactsFetched: number;
  companiesFetched: number;
  notesFetched: number;
  /** Notes associated at company level (Floor’s agent handoff). */
  companyNotesFetched: number;
  upserted: Lead[];
  skippedStrongPresence: number;
  errors: string[];
};

type HsContact = {
  id: string;
  properties: Record<string, string | null | undefined>;
  associations?: { companies?: string[]; notes?: string[] };
};

type HsCompany = {
  id: string;
  properties: Record<string, string | null | undefined>;
  associations?: { notes?: string[] };
};

type HsNote = {
  id: string;
  properties: Record<string, string | null | undefined>;
  /** Floor: agent leaves notes on the **company**, not contact-only. */
  companyIds?: string[];
  contactIds?: string[];
};

const HS_BASE = "https://api.hubapi.com";

async function hsFetch(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${HS_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Mock CRM payload: lead-gen agent wrote **company-level** notes
 * (why-good, opener, right contact). Structured props may also sit on company.
 * CRM language: English (Floor confirmed).
 */
export function mockHubSpotPayload(): {
  contacts: HsContact[];
  companies: HsCompany[];
  notes: HsNote[];
} {
  return {
    companies: [
      {
        id: "co_102",
        properties: {
          name: "Nova Legal Partners",
          city: "Amsterdam",
          country: "Netherlands",
          industry: "Legal Services",
          numberofemployees: "42",
          sg_why_good: "Litigation partner; firm voice thin on LinkedIn vs competitors.",
          sg_opener: "Ask about partner time vs content quality — Willow drafts in firm voice.",
          sg_right_contact: "Joost van Dijk (Partner)",
          sg_social_presence: "inconsistent",
          sg_vertical: "legal",
        },
        associations: { notes: ["nt_302"] },
      },
      {
        id: "co_104",
        properties: {
          name: "CloudNest IT",
          city: "Utrecht",
          country: "Netherlands",
          industry: "Information Technology",
          numberofemployees: "55",
          sg_why_good: "IT founder; content mix is pure product promo — no expertise posts.",
          sg_opener: "Content mix angle: buyers want founder POV, not feature dumps.",
          sg_right_contact: "Mark de Vries (Founder)",
          sg_social_presence: "inconsistent",
          sg_vertical: "it",
        },
        associations: { notes: ["nt_304"] },
      },
      {
        id: "co_101",
        properties: {
          name: "Peeters Accountants",
          city: "Antwerp",
          country: "Belgium",
          industry: "Accounting",
          numberofemployees: "35",
          sg_why_good:
            "Accountancy decision maker; LinkedIn posts only 2× in 90 days — consistency gap.",
          sg_opener:
            "Vacancies posted online, but the firm LinkedIn page is quiet — little employer-brand story for candidates.",
          sg_right_contact: "Els Peeters (Managing Partner)",
          sg_social_presence: "weak",
          sg_vertical: "accountancy",
        },
        associations: { notes: ["nt_301"] },
      },
      {
        id: "co_103",
        properties: {
          name: "BrightHire Executive Search",
          city: "Brussels",
          country: "Belgium",
          industry: "Human Resources",
          numberofemployees: "18",
          sg_why_good:
            "Exec search founder; open vacancies online with no company storytelling.",
          sg_opener: "Tie open roles to visibility — expertise B2B buyers check LinkedIn first.",
          sg_right_contact: "Amélie Dubois (Founder)",
          sg_social_presence: "weak",
          sg_vertical: "hr_recruitment",
        },
        associations: { notes: ["nt_303"] },
      },
      {
        id: "co_105",
        properties: {
          name: "SocialPro Agency",
          city: "Ghent",
          country: "Belgium",
          industry: "Marketing",
          numberofemployees: "22",
          sg_why_good: "Already polished social presence — agent flagged skip.",
          sg_opener: "N/A — strong presence",
          sg_right_contact: "Lana Verstraeten",
          sg_social_presence: "strong",
          sg_vertical: "expertise_b2b",
        },
        associations: { notes: ["nt_305"] },
      },
    ],
    contacts: [
      {
        id: "ct_202",
        properties: {
          firstname: "Joost",
          lastname: "van Dijk",
          jobtitle: "Partner",
          email: "j.vandijk@novalegal.nl",
          hs_linkedin_url: "https://www.linkedin.com/in/example-joost-vandijk",
          city: "Amsterdam",
          country: "Netherlands",
          lifecyclestage: "salesqualifiedlead",
        },
        associations: { companies: ["co_102"] },
      },
      {
        id: "ct_204",
        properties: {
          firstname: "Mark",
          lastname: "de Vries",
          jobtitle: "Founder & CEO",
          email: "mark@cloudnest.nl",
          city: "Utrecht",
          country: "Netherlands",
          lifecyclestage: "opportunity",
        },
        associations: { companies: ["co_104"] },
      },
      {
        id: "ct_201",
        properties: {
          firstname: "Els",
          lastname: "Peeters",
          jobtitle: "Managing Partner",
          email: "els.peeters@peeters-accountants.example",
          hs_linkedin_url: "https://www.linkedin.com/in/example-els-peeters",
          city: "Antwerp",
          country: "Belgium",
          lifecyclestage: "marketingqualifiedlead",
        },
        associations: { companies: ["co_101"] },
      },
      {
        id: "ct_203",
        properties: {
          firstname: "Amélie",
          lastname: "Dubois",
          jobtitle: "Founder",
          email: "amelie@brighthire.be",
          city: "Brussels",
          country: "Belgium",
          lifecyclestage: "lead",
        },
        associations: { companies: ["co_103"] },
      },
      {
        id: "ct_205",
        properties: {
          firstname: "Lana",
          lastname: "Verstraeten",
          jobtitle: "Operations Manager",
          email: "lana@socialpro.be",
          city: "Ghent",
          country: "Belgium",
          lifecyclestage: "other",
        },
        associations: { companies: ["co_105"] },
      },
    ],
    notes: [
      {
        id: "nt_301",
        companyIds: ["co_101"],
        properties: {
          hs_note_body:
            "Lead-gen agent (company note, EN): why-good = consistency gap for Peeters Accountants. Opener ready. Right contact = Els Peeters (Managing Partner).",
        },
      },
      {
        id: "nt_302",
        companyIds: ["co_102"],
        properties: {
          hs_note_body:
            "Company note (EN): content quality thin vs peer NL firms. Partner Joost is the buyer.",
        },
      },
      {
        id: "nt_303",
        companyIds: ["co_103"],
        properties: {
          hs_note_body:
            "Company note (EN): open vacancies unused online — no employer brand story. Founder Amélie decides.",
        },
      },
      {
        id: "nt_304",
        companyIds: ["co_104"],
        properties: {
          hs_note_body:
            "Company note (EN): content mix skewed to promo. Founder Mark owns LinkedIn strategy.",
        },
      },
      {
        id: "nt_305",
        companyIds: ["co_105"],
        properties: {
          hs_note_body: "SKIP (company note, EN): SocialPro already has excellent social presence.",
        },
      },
    ],
  };
}

function companyById(companies: HsCompany[], id?: string): HsCompany | undefined {
  if (!id) return undefined;
  return companies.find((c) => c.id === id);
}

/** Prefer company-level notes (Floor’s agent handoff); contact notes are fallback only. */
function notesForCompany(notes: HsNote[], companyId?: string): HsNote[] {
  if (!companyId) return [];
  return notes.filter((n) => n.companyIds?.includes(companyId));
}

function notesForContact(notes: HsNote[], contactId: string): HsNote[] {
  return notes.filter((n) => n.contactIds?.includes(contactId));
}

function buildCrmContext(
  companyProps: Record<string, string | null | undefined>,
  contactProps: Record<string, string | null | undefined>,
  noteBodies: string[],
  propertyMap: HubSpotPropertyMap,
): CrmAgentContext {
  // Company props preferred (agent handoff surface), then contact props, then note body.
  const whyGood =
    companyProps[propertyMap.whyGood] ?? contactProps[propertyMap.whyGood] ?? undefined;
  const opener =
    companyProps[propertyMap.opener] ?? contactProps[propertyMap.opener] ?? undefined;
  const rightContact =
    companyProps[propertyMap.rightContact] ??
    contactProps[propertyMap.rightContact] ??
    undefined;
  const rawNote = noteBodies.filter(Boolean).join("\n\n") || undefined;
  return {
    whyGood: whyGood || undefined,
    opener: opener || undefined,
    rightContact: rightContact || undefined,
    rawNote,
  };
}

function contactToLead(
  contact: HsContact,
  company: HsCompany | undefined,
  notes: HsNote[],
  stageMap: HubSpotStageMap,
  propertyMap: HubSpotPropertyMap,
): Lead {
  const p = contact.properties;
  const cp = company?.properties ?? {};
  const first = p.firstname ?? "";
  const last = p.lastname ?? "";
  const contactName = `${first} ${last}`.trim() || p.email || "Unknown contact";
  const firmName = (cp.name as string) || "Unknown firm";
  const title = p.jobtitle ?? "";
  const location = [p.city || cp.city, p.country || cp.country].filter(Boolean).join(", ");
  const industry = (cp.industry as string) || "";
  const practiceArea = industry || "Expertise B2B";
  const firmSize = String(cp.numberofemployees ?? "unknown");
  const socialPresence = parseSocialPresence(
    (cp[propertyMap.socialPresence] as string | undefined) ??
      (p[propertyMap.socialPresence] as string | undefined),
  ) as SocialPresenceSignal;
  const verticalProp = (cp[propertyMap.vertical] ?? p[propertyMap.vertical]) as
    | ExpertiseVertical
    | undefined;
  const noteBodies = notes
    .map((n) => n.properties.hs_note_body)
    .filter((x): x is string => typeof x === "string");
  const crm = buildCrmContext(cp, p, noteBodies, propertyMap);
  const scored = scoreExpertiseIcp({
    title,
    firmName,
    practiceArea,
    location,
    firmSize,
    socialPresence,
    vertical: verticalProp,
    industry,
  });
  const stageLabel = p.lifecyclestage ?? p.dealstage ?? "lead";
  let stage: LeadStage = mapHubSpotStage(stageLabel, stageMap);
  if (scored.disqualify) stage = "disqualified";

  const notesText = [
    crm.whyGood ? `Why: ${crm.whyGood}` : null,
    crm.opener ? `Opener: ${crm.opener}` : null,
    crm.rightContact ? `Contact: ${crm.rightContact}` : null,
    crm.rawNote,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: `hs_${contact.id}`,
    firmName,
    contactName,
    title,
    email: p.email ?? `${contact.id}@hubspot.example`,
    linkedInUrl: p.hs_linkedin_url || p.linkedin_url || undefined,
    location: location || "Netherlands",
    practiceArea,
    firmSize,
    icpScore: scored.score,
    stage,
    source: "hubspot",
    geoCode: scored.geoCode ?? detectGeoCode(location),
    notes: notesText || undefined,
    createdAt: new Date().toISOString(),
    vertical: scored.vertical,
    socialPresence,
    crm,
    hubspotContactId: contact.id,
    hubspotCompanyId: company?.id,
    hubspotStageLabel: stageLabel || undefined,
  };
}

async function fetchLiveContacts(token: string): Promise<{
  contacts: HsContact[];
  companies: HsCompany[];
  notes: HsNote[];
  errors: string[];
}> {
  const errors: string[] = [];
  const contactProps = [
    "firstname",
    "lastname",
    "jobtitle",
    "email",
    "hs_linkedin_url",
    "city",
    "country",
    "lifecyclestage",
  ].join(",");

  const companyProps = [
    "name",
    "city",
    "country",
    "industry",
    "numberofemployees",
    DEFAULT_PROPERTY_MAP.whyGood,
    DEFAULT_PROPERTY_MAP.opener,
    DEFAULT_PROPERTY_MAP.rightContact,
    DEFAULT_PROPERTY_MAP.socialPresence,
    DEFAULT_PROPERTY_MAP.vertical,
  ].join(",");

  const contacts: HsContact[] = [];
  const companies: HsCompany[] = [];
  const notes: HsNote[] = [];

  try {
    const res = await hsFetch(
      token,
      `/crm/v3/objects/contacts?limit=50&properties=${encodeURIComponent(contactProps)}&associations=companies`,
    );
    if (!res.ok) {
      errors.push(`HubSpot contacts ${res.status}: ${await res.text()}`);
      return { contacts, companies, notes, errors };
    }
    const data = (await res.json()) as {
      results?: Array<{
        id: string;
        properties: Record<string, string | null>;
        associations?: Record<
          string,
          { results?: Array<{ id: string; type?: string }> }
        >;
      }>;
    };
    for (const row of data.results ?? []) {
      const companyIds =
        row.associations?.companies?.results?.map((r) => r.id) ?? [];
      contacts.push({
        id: row.id,
        properties: row.properties,
        associations: { companies: companyIds },
      });
    }
  } catch (e) {
    errors.push(`Contacts fetch failed: ${e instanceof Error ? e.message : String(e)}`);
    return { contacts, companies, notes, errors };
  }

  const companyIds = [...new Set(contacts.flatMap((c) => c.associations?.companies ?? []))];
  for (const id of companyIds.slice(0, 50)) {
    try {
      const res = await hsFetch(
        token,
        `/crm/v3/objects/companies/${id}?properties=${encodeURIComponent(companyProps)}&associations=notes`,
      );
      if (!res.ok) {
        errors.push(`Company ${id}: ${res.status}`);
        continue;
      }
      const row = (await res.json()) as {
        id: string;
        properties: Record<string, string | null>;
        associations?: Record<string, { results?: Array<{ id: string }> }>;
      };
      const noteIds = row.associations?.notes?.results?.map((r) => r.id) ?? [];
      companies.push({
        id: row.id,
        properties: row.properties,
        associations: { notes: noteIds },
      });
    } catch (e) {
      errors.push(`Company ${id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const noteIds = [...new Set(companies.flatMap((c) => c.associations?.notes ?? []))];
  for (const id of noteIds.slice(0, 50)) {
    try {
      const res = await hsFetch(token, `/crm/v3/objects/notes/${id}?properties=hs_note_body`);
      if (!res.ok) {
        errors.push(`Note ${id}: ${res.status}`);
        continue;
      }
      const row = (await res.json()) as {
        id: string;
        properties: Record<string, string | null>;
      };
      const companyIdsForNote = companies
        .filter((c) => c.associations?.notes?.includes(id))
        .map((c) => c.id);
      notes.push({ id: row.id, properties: row.properties, companyIds: companyIdsForNote });
    } catch (e) {
      errors.push(`Note ${id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return { contacts, companies, notes, errors };
}

export async function syncHubSpotContacts(options?: {
  token?: string | null;
  stageMap?: HubSpotStageMap;
  propertyMap?: HubSpotPropertyMap;
}): Promise<HubSpotSyncResult> {
  const token = options?.token ?? process.env.HUBSPOT_ACCESS_TOKEN ?? null;
  const mode = resolveHubSpotMode(token);
  const stageMap = options?.stageMap ?? DEFAULT_STAGE_MAP;
  const propertyMap = options?.propertyMap ?? DEFAULT_PROPERTY_MAP;
  const errors: string[] = [];

  let contacts: HsContact[] = [];
  let companies: HsCompany[] = [];
  let notes: HsNote[] = [];

  if (mode === "live" && token) {
    const live = await fetchLiveContacts(token);
    contacts = live.contacts;
    companies = live.companies;
    notes = live.notes;
    errors.push(...live.errors);
    if (contacts.length === 0 && errors.length > 0) {
      // Fall back to mock so Floor can still demo if token is wrong.
      const mock = mockHubSpotPayload();
      contacts = mock.contacts;
      companies = mock.companies;
      notes = mock.notes;
      errors.push("Live HubSpot returned no contacts — serving mock payload for continuity.");
    }
  } else {
    const mock = mockHubSpotPayload();
    contacts = mock.contacts;
    companies = mock.companies;
    notes = mock.notes;
  }

  const upserted: Lead[] = [];
  let skippedStrongPresence = 0;
  let companyNotesFetched = 0;

  for (const contact of contacts) {
    const coId = contact.associations?.companies?.[0];
    const company = companyById(companies, coId);
    const companyNotes = notesForCompany(notes, coId);
    const contactNotes = notesForContact(notes, contact.id);
    // Company notes are the agent handoff; contact notes only if company has none.
    const effectiveNotes = companyNotes.length > 0 ? companyNotes : contactNotes;
    if (companyNotes.length > 0) companyNotesFetched += companyNotes.length;
    const lead = contactToLead(contact, company, effectiveNotes, stageMap, propertyMap);
    if (lead.socialPresence === "strong") skippedStrongPresence += 1;
    upserted.push(lead);
  }

  return {
    mode: mode === "live" && !errors.some((e) => e.includes("serving mock")) ? "live" : mode,
    contactsFetched: contacts.length,
    companiesFetched: companies.length,
    notesFetched: notes.length,
    companyNotesFetched,
    upserted,
    skippedStrongPresence,
    errors,
  };
}

/**
 * Push internal stage back to HubSpot (English labels only — Floor CRM language rule).
 * No-op in mock mode.
 */
export async function pushLeadStageToHubSpot(
  lead: Lead,
  stage: LeadStage,
  token?: string | null,
): Promise<{ ok: boolean; mode: "mock" | "live"; detail: string; crmLanguage: "en" }> {
  const t = token ?? process.env.HUBSPOT_ACCESS_TOKEN ?? null;
  const mode = resolveHubSpotMode(t);
  const englishLabel = HUBSPOT_ENGLISH_STAGE_LABELS[stage] ?? "lead";
  if (mode === "mock" || !t || !lead.hubspotContactId) {
    return {
      ok: true,
      mode: "mock",
      detail: `Mock stage sync (EN): ${lead.contactName} → ${englishLabel} (no HubSpot write)`,
      crmLanguage: "en",
    };
  }
  try {
    const properties: Record<string, string> = {
      lifecyclestage:
        stage === "demo_booked" ||
        stage === "demo_completed" ||
        stage === "demo_rescheduled" ||
        stage === "demo_cancelled"
          ? "customer"
          : englishLabel.toLowerCase().replace(/\s+/g, ""),
    };
    if (
      stage === "demo_completed" ||
      stage === "demo_rescheduled" ||
      stage === "demo_cancelled" ||
      stage === "demo_booked"
    ) {
      properties.sg_demo_outcome = englishLabel;
    }
    const res = await hsFetch(t, `/crm/v3/objects/contacts/${lead.hubspotContactId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) {
      return { ok: false, mode: "live", detail: await res.text(), crmLanguage: "en" };
    }
    return {
      ok: true,
      mode: "live",
      detail: `Updated HubSpot contact ${lead.hubspotContactId} (EN: ${englishLabel})`,
      crmLanguage: "en",
    };
  } catch (e) {
    return {
      ok: false,
      mode: "live",
      detail: e instanceof Error ? e.message : String(e),
      crmLanguage: "en",
    };
  }
}
