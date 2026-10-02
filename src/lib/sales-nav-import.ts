import type { Lead, LeadSource } from "@/types/sales";
import { parseCsv, rowsToObjects } from "@/lib/csv";
import {
  DEFAULT_GEO_FILTER,
  detectGeoCode,
  geoScoreBonus,
  geoTier,
  matchesGeoFilter,
  type GeoCode,
} from "@/lib/geo";

/** Canonical fields we map Sales Nav columns onto. */
export type SalesNavField =
  | "firstName"
  | "lastName"
  | "fullName"
  | "title"
  | "company"
  | "email"
  | "linkedInUrl"
  | "location"
  | "companyLocation"
  | "industry"
  | "companySize"
  | "notes";

export const SALES_NAV_FIELD_LABELS: Record<SalesNavField, string> = {
  firstName: "First name",
  lastName: "Last name",
  fullName: "Full name",
  title: "Title",
  company: "Company",
  email: "Email",
  linkedInUrl: "LinkedIn URL",
  location: "Location",
  companyLocation: "Company location",
  industry: "Industry",
  companySize: "Company size",
  notes: "Notes",
};

/** Common Sales Navigator Lead List / CSV export header aliases (case-insensitive). */
const ALIASES: Record<SalesNavField, string[]> = {
  firstName: ["first name", "firstname", "first", "given name", "voornaam"],
  lastName: ["last name", "lastname", "last", "surname", "family name", "achternaam"],
  fullName: ["full name", "name", "lead name", "contact name", "naam"],
  title: ["title", "job title", "position", "headline", "functie"],
  company: [
    "company",
    "company name",
    "account name",
    "organization",
    "organisation",
    "firm",
    "bedrijf",
  ],
  email: ["email", "email address", "e-mail", "work email", "e-mailadres"],
  linkedInUrl: [
    "linkedin url",
    "linkedin",
    "profile url",
    "linkedin profile url",
    "person linkedin url",
    "linkedin profile",
    "public profile url",
  ],
  location: ["location", "geography", "region", "city", "person location", "contact location"],
  companyLocation: [
    "company location",
    "company headquarters",
    "hq location",
    "company city",
    "company country",
    "account location",
  ],
  industry: ["industry", "company industry", "sector"],
  companySize: [
    "company size",
    "employees",
    "employee count",
    "company employees",
    "headcount",
    "firm size",
  ],
  notes: ["notes", "note", "description", "about"],
};

export type ColumnMapping = Partial<Record<SalesNavField, string>>;

export interface ImportPreviewRow {
  rowIndex: number;
  raw: Record<string, string>;
  contactName: string;
  title: string;
  firmName: string;
  email: string;
  linkedInUrl: string;
  location: string;
  practiceArea: string;
  firmSize: string;
  geoCode: GeoCode;
  geoTier: ReturnType<typeof geoTier>;
  icpScore: number;
  icpRationale: string;
  isDuplicate: boolean;
  duplicateOf?: string;
  passesGeoFilter: boolean;
  selected: boolean;
}

export interface ImportPreviewResult {
  headers: string[];
  mapping: ColumnMapping;
  unmappedHeaders: string[];
  rows: ImportPreviewRow[];
  summary: {
    total: number;
    afterGeo: number;
    duplicates: number;
    highIcp: number;
  };
  geoFilter: GeoCode[];
  minScore: number;
}

export interface ImportCommitRow {
  contactName: string;
  title: string;
  firmName: string;
  email: string;
  linkedInUrl?: string;
  location: string;
  practiceArea: string;
  firmSize: string;
  icpScore: number;
  notes?: string;
  geoCode?: GeoCode;
}

function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_/]+/g, " ").replace(/\s+/g, " ");
}

export function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();
  const normalized = headers.map((h) => ({ raw: h, n: normHeader(h) }));

  (Object.keys(ALIASES) as SalesNavField[]).forEach((field) => {
    const aliases = ALIASES[field];
    const hit = normalized.find((h) => !used.has(h.raw) && aliases.includes(h.n));
    if (hit) {
      mapping[field] = hit.raw;
      used.add(hit.raw);
    }
  });

  return mapping;
}

function cell(raw: Record<string, string>, mapping: ColumnMapping, field: SalesNavField): string {
  const header = mapping[field];
  if (!header) return "";
  return (raw[header] ?? "").trim();
}

function contactNameFrom(raw: Record<string, string>, mapping: ColumnMapping): string {
  const full = cell(raw, mapping, "fullName");
  if (full) return full;
  const first = cell(raw, mapping, "firstName");
  const last = cell(raw, mapping, "lastName");
  return [first, last].filter(Boolean).join(" ").trim();
}

function normalizeLinkedIn(url: string): string {
  if (!url) return "";
  let u = url.trim();
  if (!/^https?:\/\//i.test(u) && /linkedin\.com/i.test(u)) u = `https://${u}`;
  return u.replace(/\/+$/, "").toLowerCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const LEGAL_TITLE =
  /\b(partner|counsel|attorney|advocate|advocaat|avocat|avocate|rechtsanwalt|solicitor|barrister|associate|of counsel|managing partner|practice manager|marketing|business development|bdm|cmo)\b/i;

const LEGAL_FIRM =
  /\b(law|legal|llp|advocaten|avocats|avocat|rechtsanwält|solicitor|barrister|notaris|notary|cabinet|studio legale|advocatenkantoor|advocatenbureau)\b/i;

const PRACTICE_HINTS: { re: RegExp; label: string }[] = [
  { re: /\b(m&a|corporate|vennootschap|ondernemingsrecht)\b/i, label: "Corporate / M&A" },
  { re: /\b(litigation|geschillen|procès|prozess)\b/i, label: "Litigation" },
  { re: /\b(employment|labour|labor|arbeidsrecht|travail)\b/i, label: "Employment" },
  { re: /\b(real estate|vastgoed|immobilier|property)\b/i, label: "Real estate" },
  { re: /\b(family|famille|familierecht)\b/i, label: "Family" },
  { re: /\b(ip|intellectual|tech|privacy|gdpr|avg)\b/i, label: "IP / Tech" },
];

export function inferPracticeArea(title: string, industry: string, notes: string): string {
  const hay = `${title} ${industry} ${notes}`;
  for (const { re, label } of PRACTICE_HINTS) {
    if (re.test(hay)) return label;
  }
  if (LEGAL_FIRM.test(hay) || LEGAL_TITLE.test(title)) return "General practice";
  return industry || "General practice";
}

export function scoreLawyerIcp(input: {
  title: string;
  firmName: string;
  industry: string;
  firmSize: string;
  geoCode: GeoCode;
  email: string;
  linkedInUrl: string;
}): { score: number; rationale: string } {
  let score = 40;
  const reasons: string[] = [];

  if (LEGAL_TITLE.test(input.title)) {
    score += 16;
    reasons.push("Legal / BD title fit.");
  }
  if (LEGAL_FIRM.test(input.firmName) || LEGAL_FIRM.test(input.industry)) {
    score += 14;
    reasons.push("Law-firm / legal industry signals.");
  }

  const bonus = geoScoreBonus(input.geoCode);
  if (bonus > 0) {
    score += bonus;
    const tier = geoTier(input.geoCode);
    if (tier === "primary") reasons.push("Belgium — primary Willow ICP market.");
    else if (tier === "secondary") reasons.push("Netherlands — secondary Willow ICP market.");
  } else {
    reasons.push("Out of scope — BE + NL only.");
  }

  if (/\b(10|11|12|1[3-9]|[2-9]\d|[1-9]\d{2,})\b/.test(input.firmSize) ||
      /\b(11-50|51-200|201-500|10–25|25–50|50–100)\b/i.test(input.firmSize)) {
    score += 8;
    reasons.push("Firm-size band near ICP.");
  }

  if (input.email) score += 4;
  if (input.linkedInUrl) score += 4;

  score = Math.max(0, Math.min(98, score));
  return { score, rationale: reasons.join(" ") };
}

export function findDuplicate(
  candidate: { email: string; linkedInUrl: string },
  existing: Lead[],
): Lead | undefined {
  const email = normalizeEmail(candidate.email);
  const li = normalizeLinkedIn(candidate.linkedInUrl);
  return existing.find((l) => {
    if (email && normalizeEmail(l.email) === email) return true;
    if (li && l.linkedInUrl && normalizeLinkedIn(l.linkedInUrl) === li) return true;
    return false;
  });
}

export function previewSalesNavCsv(
  csvText: string,
  existingLeads: Lead[],
  options?: {
    mapping?: ColumnMapping;
    geoFilter?: GeoCode[];
    minScore?: number;
  },
): ImportPreviewResult {
  const { headers, rows } = parseCsv(csvText);
  if (headers.length === 0) {
    return {
      headers: [],
      mapping: {},
      unmappedHeaders: [],
      rows: [],
      summary: { total: 0, afterGeo: 0, duplicates: 0, highIcp: 0 },
      geoFilter: options?.geoFilter ?? [...DEFAULT_GEO_FILTER],
      minScore: options?.minScore ?? 70,
    };
  }

  const mapping = options?.mapping ?? autoMapColumns(headers);
  const geoFilter = options?.geoFilter ?? [...DEFAULT_GEO_FILTER];
  const minScore = options?.minScore ?? 70;
  const mappedHeaders = new Set(Object.values(mapping));
  const unmappedHeaders = headers.filter((h) => !mappedHeaders.has(h));
  const objects = rowsToObjects(headers, rows);

  const previewRows: ImportPreviewRow[] = objects.map((raw, rowIndex) => {
    const contactName = contactNameFrom(raw, mapping) || "Unknown contact";
    const title = cell(raw, mapping, "title") || "Contact";
    const firmName = cell(raw, mapping, "company") || "Unknown firm";
    const email = cell(raw, mapping, "email");
    const linkedInUrl = cell(raw, mapping, "linkedInUrl");
    const locationRaw =
      cell(raw, mapping, "location") ||
      cell(raw, mapping, "companyLocation") ||
      "";
    const industry = cell(raw, mapping, "industry");
    const firmSize = cell(raw, mapping, "companySize") || "Unknown";
    const notes = cell(raw, mapping, "notes");
    const geoCode = detectGeoCode(locationRaw, firmName, email);
    const location =
      locationRaw ||
      (geoCode !== "OTHER" ? geoCode : "Unknown");
    const practiceArea = inferPracticeArea(title, industry, notes);
    const { score, rationale } = scoreLawyerIcp({
      title,
      firmName,
      industry,
      firmSize,
      geoCode,
      email,
      linkedInUrl,
    });
    const dup = findDuplicate({ email, linkedInUrl }, existingLeads);
    const passesGeo = matchesGeoFilter(geoCode, geoFilter);
    const selected = passesGeo && !dup && score >= minScore;

    return {
      rowIndex,
      raw,
      contactName,
      title,
      firmName,
      email,
      linkedInUrl,
      location,
      practiceArea,
      firmSize,
      geoCode,
      geoTier: geoTier(geoCode),
      icpScore: score,
      icpRationale: rationale,
      isDuplicate: !!dup,
      duplicateOf: dup?.id,
      passesGeoFilter: passesGeo,
      selected,
    };
  });

  const afterGeo = previewRows.filter((r) => r.passesGeoFilter);
  return {
    headers,
    mapping,
    unmappedHeaders,
    rows: previewRows,
    summary: {
      total: previewRows.length,
      afterGeo: afterGeo.length,
      duplicates: previewRows.filter((r) => r.isDuplicate).length,
      highIcp: previewRows.filter((r) => r.icpScore >= minScore && r.passesGeoFilter && !r.isDuplicate)
        .length,
    },
    geoFilter,
    minScore,
  };
}

export function previewRowsToLeads(
  rows: ImportCommitRow[],
  source: LeadSource = "sales_nav_csv",
): Lead[] {
  const now = Date.now();
  return rows.map((row, i) => {
    const geo = row.geoCode ?? detectGeoCode(row.location, row.firmName, row.email);
    const location =
      row.location.includes(",") || geo === "OTHER"
        ? row.location
        : `${row.location}, ${geo}`;
    return {
      id: `lead_sn_${now}_${i}_${Math.random().toString(36).slice(2, 7)}`,
      firmName: row.firmName,
      contactName: row.contactName,
      title: row.title,
      email: row.email || `${row.contactName.toLowerCase().replace(/\s+/g, ".")}@unknown.example`,
      linkedInUrl: row.linkedInUrl || undefined,
      location,
      practiceArea: row.practiceArea,
      firmSize: row.firmSize,
      icpScore: row.icpScore,
      stage: "new" as const,
      source,
      geoCode: geo,
      notes: [
        row.notes,
        `Import rationale: ${scoreLawyerIcp({
          title: row.title,
          firmName: row.firmName,
          industry: row.practiceArea,
          firmSize: row.firmSize,
          geoCode: geo,
          email: row.email,
          linkedInUrl: row.linkedInUrl ?? "",
        }).rationale}`,
        "Human-reviewed Sales Nav import — do not blast without BDR send.",
      ]
        .filter(Boolean)
        .join(" "),
      createdAt: new Date(now - i * 1000).toISOString(),
    };
  });
}
