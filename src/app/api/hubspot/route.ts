import { NextResponse } from "next/server";
import { readState, upsertHubSpotLeads, updateLead } from "@/lib/db";
import { defaultHubSpotConfig } from "@/lib/hubspot-config";
import { pushLeadStageToHubSpot, syncHubSpotContacts } from "@/lib/hubspot";

export async function GET() {
  const state = await readState();
  const cfg = state.hubspot ?? defaultHubSpotConfig();
  const tokenSet = Boolean(process.env.HUBSPOT_ACCESS_TOKEN?.trim());
  return NextResponse.json({
    mode: tokenSet ? "live" : "mock",
    tokenConfigured: tokenSet,
    lastSyncAt: cfg.lastSyncAt ?? null,
    stageMap: cfg.stageMap,
    propertyMap: cfg.propertyMap,
    note: tokenSet
      ? "HUBSPOT_ACCESS_TOKEN set — sync will call HubSpot CRM API."
      : "No HUBSPOT_ACCESS_TOKEN — sync uses mock CRM notes (why/opener/contact).",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (action === "sync") {
    const state = await readState();
    const result = await syncHubSpotContacts({
      stageMap: state.hubspot?.stageMap,
      propertyMap: state.hubspot?.propertyMap,
    });
    const { added, updated } = await upsertHubSpotLeads(result.upserted);
    return NextResponse.json({
      ...result,
      addedCount: added.length,
      updatedCount: updated.length,
      added,
      updated,
      governance:
        "Human-in-the-loop: sync only imports CRM context. Sequences stay draft → approve → mark sent. No auto-blast.",
    });
  }

  if (action === "push_stage") {
    const leadId = body.leadId as string | undefined;
    const stage = body.stage as string | undefined;
    if (!leadId || !stage) {
      return NextResponse.json({ error: "leadId and stage required" }, { status: 400 });
    }
    const lead = (await readState()).leads.find((l) => l.id === leadId);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const updated = await updateLead(leadId, { stage: stage as never });
    const push = await pushLeadStageToHubSpot(lead, stage as never);
    return NextResponse.json({ lead: updated, hubspot: push });
  }

  return NextResponse.json(
    { error: "Unknown action — use sync or push_stage" },
    { status: 400 },
  );
}
