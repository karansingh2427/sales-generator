import { promises as fs } from "fs";
import path from "path";
import type {
  DemoBooking,
  Lead,
  OutreachDraft,
  OutreachSequence,
  SequenceStep,
  WorkspaceState,
} from "@/types/sales";
import { generateMockLead, seedLeads } from "@/lib/mock-leads";
import type { ImportCommitRow } from "@/lib/sales-nav-import";
import { findDuplicate, previewRowsToLeads } from "@/lib/sales-nav-import";
import { defaultHubSpotConfig } from "@/lib/hubspot-config";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "workspace.json");

const defaultState = (): WorkspaceState => ({
  leads: seedLeads(),
  outreach: [],
  bookings: [],
  sequences: [],
  hubspot: defaultHubSpotConfig(),
  bdrName: "Floor Hoefkens",
  updatedAt: new Date().toISOString(),
});

function migrateState(raw: WorkspaceState): WorkspaceState {
  return {
    ...defaultState(),
    ...raw,
    leads: raw.leads ?? [],
    outreach: raw.outreach ?? [],
    bookings: raw.bookings ?? [],
    sequences: raw.sequences ?? [],
    hubspot: raw.hubspot ?? defaultHubSpotConfig(),
    bdrName: raw.bdrName ?? "Floor Hoefkens",
  };
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readState(): Promise<WorkspaceState> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    return migrateState(JSON.parse(raw) as WorkspaceState);
  } catch {
    const state = defaultState();
    await writeState(state);
    return state;
  }
}

export async function writeState(state: WorkspaceState): Promise<void> {
  await ensureDataDir();
  state.updatedAt = new Date().toISOString();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

export async function findLead(id: string): Promise<Lead | undefined> {
  const state = await readState();
  return state.leads.find((l) => l.id === id);
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<Lead | null> {
  const state = await readState();
  const idx = state.leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  state.leads[idx] = { ...state.leads[idx], ...patch };
  await writeState(state);
  return state.leads[idx];
}

/** Demo / sample data fallback — not live Sales Nav / HubSpot. */
export async function addGeneratedLeads(
  count: number,
  filters: { practiceArea?: string; minScore?: number },
): Promise<Lead[]> {
  const state = await readState();
  const added: Lead[] = [];
  for (let i = 0; i < count; i++) {
    added.push(generateMockLead(filters));
  }
  state.leads = [...added, ...state.leads];
  await writeState(state);
  return added;
}

/** Persist human-reviewed Sales Nav rows; skip duplicates by email / LinkedIn URL. */
export async function addImportedLeads(rows: ImportCommitRow[]): Promise<{
  added: Lead[];
  skippedDuplicates: number;
}> {
  const state = await readState();
  const accepted: ImportCommitRow[] = [];
  let skippedDuplicates = 0;
  for (const row of rows) {
    const dup = findDuplicate(
      { email: row.email, linkedInUrl: row.linkedInUrl ?? "" },
      [...state.leads, ...previewRowsToLeads(accepted)],
    );
    if (dup) {
      skippedDuplicates += 1;
      continue;
    }
    accepted.push(row);
  }
  const added = previewRowsToLeads(accepted, "sales_nav_csv");
  state.leads = [...added, ...state.leads];
  await writeState(state);
  return { added, skippedDuplicates };
}

/** Upsert HubSpot-synced leads by hubspotContactId or email. */
export async function upsertHubSpotLeads(incoming: Lead[]): Promise<{
  added: Lead[];
  updated: Lead[];
}> {
  const state = await readState();
  const added: Lead[] = [];
  const updated: Lead[] = [];

  for (const lead of incoming) {
    const idx = state.leads.findIndex(
      (l) =>
        (lead.hubspotContactId && l.hubspotContactId === lead.hubspotContactId) ||
        (lead.email &&
          l.email &&
          lead.email.toLowerCase() === l.email.toLowerCase()),
    );
    if (idx === -1) {
      state.leads.unshift(lead);
      added.push(lead);
    } else {
      const merged: Lead = {
        ...state.leads[idx],
        ...lead,
        id: state.leads[idx].id,
        createdAt: state.leads[idx].createdAt,
        // Preserve local pipeline progress unless HubSpot says DQ / demo booked
        stage:
          lead.stage === "disqualified" || lead.stage === "demo_booked"
            ? lead.stage
            : state.leads[idx].stage === "new" || state.leads[idx].stage === "qualified"
              ? lead.stage
              : state.leads[idx].stage,
      };
      state.leads[idx] = merged;
      updated.push(merged);
    }
  }

  state.hubspot = {
    ...state.hubspot,
    mode: process.env.HUBSPOT_ACCESS_TOKEN ? "live" : "mock",
    lastSyncAt: new Date().toISOString(),
  };
  await writeState(state);
  return { added, updated };
}

export async function addOutreach(draft: Omit<OutreachDraft, "id" | "createdAt">): Promise<OutreachDraft> {
  const state = await readState();
  const full: OutreachDraft = {
    ...draft,
    id: `out_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: draft.status ?? "draft",
  };
  state.outreach.unshift(full);
  const idx = state.leads.findIndex((l) => l.id === draft.leadId);
  if (idx !== -1) state.leads[idx] = { ...state.leads[idx], stage: "outreach_drafted" };
  await writeState(state);
  return full;
}

export async function addSequence(
  seq: Omit<OutreachSequence, "id" | "createdAt" | "updatedAt">,
): Promise<OutreachSequence> {
  const state = await readState();
  const now = new Date().toISOString();
  const full: OutreachSequence = {
    ...seq,
    id: `seq_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  state.sequences.unshift(full);
  const idx = state.leads.findIndex((l) => l.id === seq.leadId);
  if (idx !== -1) state.leads[idx] = { ...state.leads[idx], stage: "outreach_drafted" };
  // Mirror first draftable steps into outreach list for Outreach tab visibility
  for (const step of full.steps) {
    if (step.body && step.channel) {
      const draft: OutreachDraft = {
        id: `out_${Date.now()}_${step.id}`,
        leadId: full.leadId,
        channel: step.channel,
        subject: step.subject,
        body: step.body,
        rationale: step.rationale ?? "",
        createdAt: now,
        status: "draft",
        sequenceId: full.id,
        stepIndex: full.steps.indexOf(step),
      };
      step.outreachDraftId = draft.id;
      state.outreach.unshift(draft);
    }
  }
  await writeState(state);
  return full;
}

export async function updateSequenceStep(
  sequenceId: string,
  stepId: string,
  patch: Partial<SequenceStep> & { bodyText?: string },
): Promise<OutreachSequence | null> {
  const state = await readState();
  const sIdx = state.sequences.findIndex((s) => s.id === sequenceId);
  if (sIdx === -1) return null;
  const seq = state.sequences[sIdx];
  const stIdx = seq.steps.findIndex((st) => st.id === stepId);
  if (stIdx === -1) return null;

  const { bodyText, ...rest } = patch;
  const step = {
    ...seq.steps[stIdx],
    ...rest,
    body: bodyText !== undefined ? bodyText : rest.body ?? seq.steps[stIdx].body,
  };
  seq.steps[stIdx] = step;
  seq.updatedAt = new Date().toISOString();
  state.sequences[sIdx] = seq;

  if (step.outreachDraftId) {
    const oIdx = state.outreach.findIndex((o) => o.id === step.outreachDraftId);
    if (oIdx !== -1) {
      state.outreach[oIdx] = {
        ...state.outreach[oIdx],
        subject: step.subject ?? state.outreach[oIdx].subject,
        body: step.body ?? state.outreach[oIdx].body,
        status:
          step.status === "approved"
            ? "approved"
            : step.status === "sent"
              ? "sent"
              : step.status === "skipped"
                ? "skipped"
                : state.outreach[oIdx].status,
      };
    }
  }

  await writeState(state);
  return seq;
}

export async function markSequenceStepSent(
  sequenceId: string,
  stepId: string,
): Promise<OutreachSequence | null> {
  const now = new Date().toISOString();
  const seq = await updateSequenceStep(sequenceId, stepId, {
    status: "sent",
    sentAt: now,
  });
  if (!seq) return null;
  const state = await readState();
  const leadIdx = state.leads.findIndex((l) => l.id === seq.leadId);
  if (leadIdx !== -1) {
    state.leads[leadIdx] = {
      ...state.leads[leadIdx],
      stage: "contacted",
      lastTouchAt: now,
    };
  }
  const allDone = seq.steps.every(
    (s) => s.kind === "wait" || s.status === "sent" || s.status === "skipped",
  );
  if (allDone) {
    const sIdx = state.sequences.findIndex((s) => s.id === sequenceId);
    if (sIdx !== -1) {
      state.sequences[sIdx] = { ...state.sequences[sIdx], status: "completed", updatedAt: now };
    }
  } else {
    const sIdx = state.sequences.findIndex((s) => s.id === sequenceId);
    if (sIdx !== -1 && state.sequences[sIdx].status === "draft") {
      state.sequences[sIdx] = { ...state.sequences[sIdx], status: "active", updatedAt: now };
    }
  }
  await writeState(state);
  return (await readState()).sequences.find((s) => s.id === sequenceId) ?? seq;
}

export async function addBooking(
  booking: Omit<DemoBooking, "id" | "createdAt" | "status">,
): Promise<DemoBooking> {
  const state = await readState();
  const full: DemoBooking = {
    ...booking,
    id: `book_${Date.now()}`,
    status: "scheduled",
    createdAt: new Date().toISOString(),
  };
  state.bookings.unshift(full);
  const idx = state.leads.findIndex((l) => l.id === booking.leadId);
  if (idx !== -1) {
    state.leads[idx] = {
      ...state.leads[idx],
      stage: "demo_booked",
      lastTouchAt: new Date().toISOString(),
    };
  }
  await writeState(state);
  return full;
}
