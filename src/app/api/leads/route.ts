import { NextResponse } from "next/server";
import { addGeneratedLeads, readState, updateLead } from "@/lib/db";

export async function GET() {
  const state = await readState();
  return NextResponse.json({ leads: state.leads, bdrName: state.bdrName });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (action === "generate") {
    const count = Math.min(10, Math.max(1, Number(body.count) || 3));
    const practiceArea = typeof body.practiceArea === "string" ? body.practiceArea : undefined;
    const minScore = Number(body.minScore) || 75;
    const added = await addGeneratedLeads(count, { practiceArea, minScore });
    return NextResponse.json({ added });
  }

  if (action === "update_stage") {
    const { leadId, stage } = body;
    if (typeof leadId !== "string" || typeof stage !== "string") {
      return NextResponse.json({ error: "leadId and stage required" }, { status: 400 });
    }
    const updated = await updateLead(leadId, { stage: stage as never });
    if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json({ lead: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
