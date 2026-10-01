import { NextResponse } from "next/server";
import { addOutreach, findLead, readState } from "@/lib/db";
import { draftOutreach, validateOutreachRequest } from "@/lib/outreach-engine";

export async function GET() {
  const state = await readState();
  return NextResponse.json({ outreach: state.outreach });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = validateOutreachRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const lead = await findLead(parsed.leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.stage === "disqualified") {
    return NextResponse.json({ error: "Cannot outreach disqualified leads" }, { status: 422 });
  }

  const state = await readState();
  const draft = draftOutreach(lead, parsed.channel, state.bdrName);
  const saved = await addOutreach(draft);

  const useLlm = process.env.OPENAI_API_KEY && body?.useLiveModel === true;
  if (useLlm) {
    // Live model path reserved for production; MVP uses deterministic drafts.
  }

  return NextResponse.json({ draft: saved, mode: "mock_template" });
}
