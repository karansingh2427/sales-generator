import { NextResponse } from "next/server";
import {
  addFeedback,
  buildFeedbackApplication,
  deleteFeedback,
  feedbackToMarkdown,
  isFeedbackCategory,
  listFeedback,
  readFeedbackStore,
  setFeedbackActive,
  type AddFeedbackInput,
} from "@/lib/feedback";
import type { FeedbackSource, FeedbackTarget } from "@/types/sales";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("active") === "1";
  const format = url.searchParams.get("format");
  const entries = await listFeedback({ activeOnly });
  const application = buildFeedbackApplication(entries);

  if (format === "markdown") {
    return new NextResponse(feedbackToMarkdown(entries), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  return NextResponse.json({
    entries,
    application,
    storage: ".data/feedback.json",
    promoteHint:
      "Promote active feedback to skills/memory/FEEDBACK.md for Claude/Cursor sessions without the web app.",
    governance:
      "Feedback never auto-sends. Draft → approve → mark sent still required.",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (action === "add" || action === "remember") {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const categoryRaw = body.category ?? "other";
    if (!isFeedbackCategory(categoryRaw)) {
      return NextResponse.json(
        {
          error:
            "Invalid category — use icp | company | contact | messaging_tone | disqualifier | geo | sequence_quality | title_preference | other",
        },
        { status: 400 },
      );
    }
    const source = (body.source as FeedbackSource) || "ui";
    if (source !== "ui" && source !== "skill" && source !== "teach_lead") {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    let target: FeedbackTarget | undefined;
    if (body.target && typeof body.target === "object") {
      const t = body.target as Record<string, unknown>;
      if (typeof t.name === "string" && t.name.trim() && typeof t.type === "string") {
        target = {
          type: t.type as FeedbackTarget["type"],
          name: t.name.trim(),
          leadId: typeof t.leadId === "string" ? t.leadId : undefined,
          hubspotCompanyId:
            typeof t.hubspotCompanyId === "string" ? t.hubspotCompanyId : undefined,
        };
      }
    } else if (typeof body.companyName === "string" && body.companyName.trim()) {
      target = { type: "company", name: body.companyName.trim(), leadId: body.leadId };
    } else if (typeof body.leadId === "string" && body.leadId) {
      target = {
        type: "lead",
        name: typeof body.leadName === "string" ? body.leadName : body.leadId,
        leadId: body.leadId,
      };
    }

    const input: AddFeedbackInput = {
      category: categoryRaw,
      text,
      source,
      target,
      instruction: body.instruction,
    };

    try {
      const entry = await addFeedback(input);
      const store = await readFeedbackStore();
      return NextResponse.json({
        entry,
        activeCount: store.entries.filter((e) => e.active).length,
        note: "Saved. Next HubSpot pull / sequence draft / lead-run will load active feedback.",
        governance: "Does not bypass approve-before-send.",
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Could not save feedback" },
        { status: 400 },
      );
    }
  }

  if (action === "disable" || action === "enable") {
    const id = body.id as string | undefined;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const entry = await setFeedbackActive(id, action === "enable");
    if (!entry) return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    return NextResponse.json({ entry });
  }

  if (action === "delete") {
    const id = body.id as string | undefined;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const ok = await deleteFeedback(id);
    if (!ok) return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    return NextResponse.json({ deleted: id });
  }

  return NextResponse.json(
    {
      error:
        "Unknown action — use add | remember | enable | disable | delete (GET lists feedback)",
    },
    { status: 400 },
  );
}
