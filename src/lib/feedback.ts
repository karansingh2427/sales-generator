import { promises as fs } from "fs";
import path from "path";
import type {
  FeedbackApplication,
  FeedbackCategory,
  FeedbackEntry,
  FeedbackInstruction,
  FeedbackSource,
  FeedbackStore,
  FeedbackTarget,
  Lead,
} from "@/types/sales";
import { dataFile } from "@/lib/data-dir";

/** Optional skill-memory mirror Floor can promote into the repo for Claude sessions. */
export const SKILL_MEMORY_FEEDBACK = path.join(
  process.cwd(),
  "skills",
  "memory",
  "FEEDBACK.md",
);

const CATEGORIES: FeedbackCategory[] = [
  "icp",
  "company",
  "contact",
  "messaging_tone",
  "disqualifier",
  "geo",
  "sequence_quality",
  "title_preference",
  "other",
];

export function isFeedbackCategory(v: unknown): v is FeedbackCategory {
  return typeof v === "string" && (CATEGORIES as string[]).includes(v);
}

function emptyStore(): FeedbackStore {
  return { version: 1, entries: [], updatedAt: new Date().toISOString() };
}

export async function readFeedbackStore(): Promise<FeedbackStore> {
  const feedbackFile = await dataFile("feedback.json");
  try {
    const raw = await fs.readFile(feedbackFile, "utf8");
    const parsed = JSON.parse(raw) as FeedbackStore;
    return {
      version: 1,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    const store = emptyStore();
    await writeFeedbackStore(store);
    return store;
  }
}

export async function writeFeedbackStore(store: FeedbackStore): Promise<void> {
  const feedbackFile = await dataFile("feedback.json");
  store.updatedAt = new Date().toISOString();
  await fs.writeFile(feedbackFile, JSON.stringify(store, null, 2), "utf8");
}

export function activeFeedback(entries: FeedbackEntry[]): FeedbackEntry[] {
  return entries.filter((e) => e.active);
}

/**
 * Heuristic parse of free text → structured instruction.
 * Floor can still edit category/target in the UI; this helps skill + form defaults.
 */
export function inferInstruction(
  text: string,
  category: FeedbackCategory,
  target?: FeedbackTarget,
): FeedbackInstruction {
  const t = text.trim();
  const lower = t.toLowerCase();

  const skipMatch =
    lower.match(/(?:skip|never\s+(?:contact|pitch|outreach)|avoid|don'?t\s+(?:contact|pitch))\s+(.+)/i) ??
    lower.match(/no\s+(?:more\s+)?(?:outreach\s+to\s+)?(.+)/i);
  if (
    category === "company" ||
    category === "disqualifier" ||
    lower.includes("skip company") ||
    lower.startsWith("skip ")
  ) {
    const company =
      target?.type === "company"
        ? target.name
        : skipMatch?.[1]?.replace(/[.!].*$/, "").trim() || target?.name;
    if (company && company.length > 1) {
      return { kind: "skip_company", companyName: company.replace(/^["']|["']$/g, "") };
    }
  }

  if (/never\s+pitch|don'?t\s+pitch|avoid\s+pitching|no\s+mention/i.test(t)) {
    const topic =
      t.replace(/^.*?(?:never\s+pitch|don'?t\s+pitch|avoid\s+pitching|no\s+mention(?:\s+of)?)\s*/i, "")
        .replace(/[.!].*$/, "")
        .trim() || t;
    return { kind: "never_pitch", topic };
  }

  if (category === "title_preference" || /prefer\s+title|titles?\s+like|look\s+for\s+/i.test(t)) {
    const titles = extractTitleHints(t);
    if (titles.length) return { kind: "prefer_title", titles };
  }

  if (category === "messaging_tone" || /tone|less salesy|more formal|warmer|dutch|flemish/i.test(t)) {
    return { kind: "tone", note: t };
  }

  if (category === "icp" || /icp|belgium|be\s+first|decision\s+maker/i.test(t)) {
    return { kind: "icp_tweak", note: t };
  }

  if (category === "geo") {
    return { kind: "geo_note", note: t };
  }

  if (category === "sequence_quality") {
    return { kind: "sequence_note", note: t };
  }

  if (category === "disqualifier") {
    return { kind: "disqualify_pattern", pattern: t };
  }

  if (target?.type === "company" && /skip|avoid|don'?t/i.test(lower)) {
    return { kind: "skip_company", companyName: target.name };
  }

  return { kind: "freeform" };
}

function extractTitleHints(text: string): string[] {
  const known = [
    "Partner",
    "Managing Partner",
    "Founder",
    "Co-Founder",
    "CEO",
    "Ops manager",
    "Operations Manager",
    "COO",
    "Director",
  ];
  const found = known.filter((k) => new RegExp(`\\b${k}\\b`, "i").test(text));
  if (found.length) return found;
  const like = text.match(/titles?\s+(?:like|such as)\s+(.+)/i);
  if (like?.[1]) {
    return like[1]
      .split(/,| and /i)
      .map((s) => s.replace(/[.!].*$/, "").trim())
      .filter((s) => s.length > 1)
      .slice(0, 5);
  }
  return [];
}

export type AddFeedbackInput = {
  category: FeedbackCategory;
  text: string;
  source: FeedbackSource;
  target?: FeedbackTarget;
  instruction?: FeedbackInstruction;
};

export async function addFeedback(input: AddFeedbackInput): Promise<FeedbackEntry> {
  const text = input.text.trim();
  if (!text) throw new Error("Feedback text is required");
  if (!isFeedbackCategory(input.category)) throw new Error("Invalid feedback category");

  const store = await readFeedbackStore();
  const now = new Date().toISOString();
  const instruction =
    input.instruction ?? inferInstruction(text, input.category, input.target);
  const entry: FeedbackEntry = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category: input.category,
    target: input.target,
    instruction,
    text,
    active: true,
    source: input.source,
    createdAt: now,
    updatedAt: now,
  };
  store.entries.unshift(entry);
  await writeFeedbackStore(store);
  return entry;
}

export async function setFeedbackActive(
  id: string,
  active: boolean,
): Promise<FeedbackEntry | null> {
  const store = await readFeedbackStore();
  const idx = store.entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString();
  store.entries[idx] = {
    ...store.entries[idx],
    active,
    updatedAt: now,
    disabledAt: active ? undefined : now,
  };
  await writeFeedbackStore(store);
  return store.entries[idx];
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const store = await readFeedbackStore();
  const before = store.entries.length;
  store.entries = store.entries.filter((e) => e.id !== id);
  if (store.entries.length === before) return false;
  await writeFeedbackStore(store);
  return true;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function companyMatches(lead: Lead, companyName: string): boolean {
  const a = norm(lead.firmName);
  const b = norm(companyName);
  return a === b || a.includes(b) || b.includes(a);
}

function titleMatchesPreferred(title: string, preferred: string[]): boolean {
  const t = norm(title);
  return preferred.some((p) => t.includes(norm(p)));
}

/**
 * Collapse active feedback into an application summary (for digests + engines).
 */
export function buildFeedbackApplication(entries: FeedbackEntry[]): FeedbackApplication {
  const active = activeFeedback(entries);
  const app: FeedbackApplication = {
    skippedLeadIds: [],
    skippedCompanies: [],
    preferredTitles: [],
    neverPitchTopics: [],
    toneNotes: [],
    icpNotes: [],
    sequenceNotes: [],
    geoNotes: [],
    disqualifyPatterns: [],
    digestLines: [],
    appliedEntryIds: active.map((e) => e.id),
  };

  for (const e of active) {
    const inst = e.instruction;
    switch (inst.kind) {
      case "skip_company":
        if (!app.skippedCompanies.some((c) => norm(c) === norm(inst.companyName))) {
          app.skippedCompanies.push(inst.companyName);
        }
        app.digestLines.push(`Skip company: ${inst.companyName}`);
        break;
      case "prefer_title":
        for (const title of inst.titles) {
          if (!app.preferredTitles.some((t) => norm(t) === norm(title))) {
            app.preferredTitles.push(title);
          }
        }
        app.digestLines.push(`Prefer titles: ${inst.titles.join(", ")}`);
        break;
      case "never_pitch":
        app.neverPitchTopics.push(inst.topic);
        app.digestLines.push(`Never pitch: ${inst.topic}`);
        break;
      case "tone":
        app.toneNotes.push(inst.note);
        app.digestLines.push(`Tone: ${inst.note}`);
        break;
      case "icp_tweak":
        app.icpNotes.push(inst.note);
        app.digestLines.push(`ICP: ${inst.note}`);
        break;
      case "geo_note":
        app.geoNotes.push(inst.note);
        app.digestLines.push(`Geo: ${inst.note}`);
        break;
      case "sequence_note":
        app.sequenceNotes.push(inst.note);
        app.digestLines.push(`Sequence: ${inst.note}`);
        break;
      case "disqualify_pattern":
        app.disqualifyPatterns.push(inst.pattern);
        app.digestLines.push(`Disqualify pattern: ${inst.pattern}`);
        break;
      case "freeform":
        app.digestLines.push(`[${e.category}] ${e.text}`);
        if (e.category === "messaging_tone") app.toneNotes.push(e.text);
        if (e.category === "icp") app.icpNotes.push(e.text);
        if (e.category === "sequence_quality") app.sequenceNotes.push(e.text);
        if (e.category === "geo") app.geoNotes.push(e.text);
        break;
    }
    if (e.target?.type === "company" && e.target.name && inst.kind === "freeform") {
      if (/skip|avoid|don'?t|never/i.test(e.text)) {
        if (!app.skippedCompanies.some((c) => norm(c) === norm(e.target!.name))) {
          app.skippedCompanies.push(e.target.name);
        }
      }
    }
  }

  return app;
}

export type ApplyFeedbackToLeadsResult = {
  kept: Lead[];
  skipped: Lead[];
  application: FeedbackApplication;
  /** Leads that matched prefer_title — sorted first when preferred titles exist. */
  preferredBoostIds: string[];
};

/**
 * Apply active feedback to a lead list (HubSpot pull / lead-run).
 * Skipped companies are removed from the working set (and may be DQ'd by caller).
 */
export function applyFeedbackToLeads(
  leads: Lead[],
  entries: FeedbackEntry[],
): ApplyFeedbackToLeadsResult {
  const application = buildFeedbackApplication(entries);
  const skipped: Lead[] = [];
  const kept: Lead[] = [];
  const preferredBoostIds: string[] = [];

  for (const lead of leads) {
    const skipCompany = application.skippedCompanies.some((c) => companyMatches(lead, c));
    const skipById =
      lead.id &&
      entries.some(
        (e) =>
          e.active &&
          e.target?.leadId === lead.id &&
          /skip|avoid|don'?t|never|dq|disqual/i.test(e.text),
      );
    const skipPattern = application.disqualifyPatterns.some((p) => {
      const n = norm(p);
      return (
        norm(lead.firmName).includes(n) ||
        norm(lead.practiceArea).includes(n) ||
        norm(lead.title).includes(n) ||
        (lead.notes && norm(lead.notes).includes(n))
      );
    });

    if (skipCompany || skipById || skipPattern) {
      skipped.push(lead);
      application.skippedLeadIds.push(lead.id);
      continue;
    }

    if (
      application.preferredTitles.length &&
      titleMatchesPreferred(lead.title, application.preferredTitles)
    ) {
      preferredBoostIds.push(lead.id);
    }
    kept.push(lead);
  }

  // Netherlands-first already elsewhere; here: preferred titles float up within kept.
  if (preferredBoostIds.length) {
    const boost = new Set(preferredBoostIds);
    kept.sort((a, b) => Number(boost.has(b.id)) - Number(boost.has(a.id)));
  }

  return { kept, skipped, application, preferredBoostIds };
}

/**
 * Guidance string injected into sequence draft rationales / skill prompts.
 * Does **not** bypass approve-before-send.
 */
export function sequenceGuidanceFromFeedback(application: FeedbackApplication): string {
  const parts: string[] = [];
  if (application.toneNotes.length) {
    parts.push(`Tone guidance: ${application.toneNotes.join(" | ")}`);
  }
  if (application.neverPitchTopics.length) {
    parts.push(`Never pitch / avoid: ${application.neverPitchTopics.join("; ")}`);
  }
  if (application.sequenceNotes.length) {
    parts.push(`Sequence notes: ${application.sequenceNotes.join(" | ")}`);
  }
  if (application.icpNotes.length) {
    parts.push(`ICP memory: ${application.icpNotes.join(" | ")}`);
  }
  if (application.geoNotes.length) {
    parts.push(`Geo memory: ${application.geoNotes.join(" | ")}`);
  }
  return parts.join(" · ");
}

/**
 * Soft-rewrite draft body to strip never-pitch topics (best-effort).
 * Still returns draft for human approve — never auto-sends.
 */
export function applyNeverPitchToBody(body: string, topics: string[]): string {
  if (!topics.length) return body;
  let out = body;
  for (const topic of topics) {
    const trimmed = topic.trim();
    if (trimmed.length < 3) continue;
    const re = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, "[omitted per Floor feedback]");
  }
  return out;
}

/** Markdown block for skill digests / promote-to-memory docs. */
export function feedbackToMarkdown(entries: FeedbackEntry[]): string {
  const active = activeFeedback(entries);
  const lines = [
    "# Floor learned feedback",
    "",
    `_Active: ${active.length} · Updated: ${new Date().toISOString()}_`,
    "",
    "Load and apply these on every HubSpot pull / sequence draft / lead-run.",
    "Governance: feedback never bypasses draft → approve → mark sent.",
    "",
  ];
  if (!active.length) {
    lines.push("_No active feedback yet._");
    return lines.join("\n");
  }
  for (const e of active) {
    const target = e.target ? ` · target: ${e.target.type}/${e.target.name}` : "";
    lines.push(`## ${e.id}`);
    lines.push(`- category: \`${e.category}\`${target}`);
    lines.push(`- source: ${e.source} · ${e.createdAt}`);
    lines.push(`- instruction: \`${JSON.stringify(e.instruction)}\``);
    lines.push(`- text: ${e.text}`);
    lines.push("");
  }
  return lines.join("\n");
}

export async function listFeedback(opts?: {
  activeOnly?: boolean;
}): Promise<FeedbackEntry[]> {
  const store = await readFeedbackStore();
  if (opts?.activeOnly) return activeFeedback(store.entries);
  return store.entries;
}
