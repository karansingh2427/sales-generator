import { promises as fs } from "fs";
import path from "path";
import type { DemoBooking, Lead, OutreachDraft, WorkspaceState } from "@/types/sales";
import { generateMockLead, seedLeads } from "@/lib/mock-leads";
import type { ImportCommitRow } from "@/lib/sales-nav-import";
import { findDuplicate, previewRowsToLeads } from "@/lib/sales-nav-import";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "workspace.json");

const defaultState = (): WorkspaceState => ({
  leads: seedLeads(),
  outreach: [],
  bookings: [],
  bdrName: "Floor Hoefkens",
  updatedAt: new Date().toISOString(),
});

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readState(): Promise<WorkspaceState> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw) as WorkspaceState;
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

/** Demo / sample data fallback — not live Sales Nav. */
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

export async function addOutreach(draft: Omit<OutreachDraft, "id" | "createdAt">): Promise<OutreachDraft> {
  const state = await readState();
  const full: OutreachDraft = {
    ...draft,
    id: `out_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  state.outreach.unshift(full);
  const idx = state.leads.findIndex((l) => l.id === draft.leadId);
  if (idx !== -1) state.leads[idx] = { ...state.leads[idx], stage: "outreach_drafted" };
  await writeState(state);
  return full;
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
