import { NextResponse } from "next/server";
import { addGeneratedLeads, addImportedLeads, readState, updateLead } from "@/lib/db";
import { DEFAULT_GEO_FILTER, type GeoCode } from "@/lib/geo";
import {
  previewSalesNavCsv,
  type ColumnMapping,
  type ImportCommitRow,
} from "@/lib/sales-nav-import";

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
    return NextResponse.json({ added, mode: "demo_sample" });
  }

  if (action === "import_preview") {
    const csvText = typeof body.csvText === "string" ? body.csvText : "";
    if (!csvText.trim()) {
      return NextResponse.json({ error: "csvText is required for Sales Nav preview" }, { status: 400 });
    }
    const state = await readState();
    const geoFilter = Array.isArray(body.geoFilter)
      ? (body.geoFilter.filter((g: unknown) => typeof g === "string") as GeoCode[])
      : [...DEFAULT_GEO_FILTER];
    const minScore = Number(body.minScore) || 70;
    const mapping =
      body.mapping && typeof body.mapping === "object"
        ? (body.mapping as ColumnMapping)
        : undefined;
    const preview = previewSalesNavCsv(csvText, state.leads, { mapping, geoFilter, minScore });
    return NextResponse.json({ preview });
  }

  if (action === "import_commit") {
    const rows = body.rows as ImportCommitRow[] | undefined;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "rows required — select leads after preview (human-in-the-loop)" },
        { status: 400 },
      );
    }
    if (rows.length > 200) {
      return NextResponse.json({ error: "Import capped at 200 rows per commit" }, { status: 400 });
    }
    for (const row of rows) {
      if (!row || typeof row !== "object") {
        return NextResponse.json({ error: "Each row must be an object" }, { status: 400 });
      }
      if (!row.firmName || !row.contactName) {
        return NextResponse.json(
          { error: "Each selected row needs firmName and contactName" },
          { status: 400 },
        );
      }
    }
    const { added, skippedDuplicates } = await addImportedLeads(rows);
    return NextResponse.json({
      added,
      skippedDuplicates,
      note: "Imported leads are staged as new — draft & send remain human-reviewed.",
    });
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
