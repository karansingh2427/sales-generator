import { NextResponse } from "next/server";
import { findLead, readState } from "@/lib/db";
import { pushToLemlist, resolveLemlistMode } from "@/lib/lemlist";

export async function GET() {
  return NextResponse.json({ mode: resolveLemlistMode(process.env.LEMLIST_API_KEY) });
}

/** Push one fully approved sequence to Lemlist as a campaign lead. Stub: returns the payload, sends nothing. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { sequenceId?: unknown } | null;
  if (typeof body?.sequenceId !== "string" || !body.sequenceId.trim()) {
    return NextResponse.json({ error: "sequenceId is required" }, { status: 400 });
  }
  const state = await readState();
  const sequence = state.sequences.find((s) => s.id === body.sequenceId);
  if (!sequence) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
  const lead = await findLead(sequence.leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const result = await pushToLemlist(lead, sequence);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 422 });
  return NextResponse.json(result);
}
