import { NextResponse } from "next/server";
import {
  addSequence,
  findLead,
  markSequenceStepSent,
  readState,
  stopSequenceOnReply,
  updateSequenceStep,
} from "@/lib/db";
import {
  buildSequenceForLead,
  LINKEDIN_CONNECT_NOTE_MAX,
  validateSequenceAction,
} from "@/lib/sequence-engine";
import {
  applyFeedbackToLeads,
  listFeedback,
  sequenceGuidanceFromFeedback,
} from "@/lib/feedback";

export async function GET() {
  const state = await readState();
  return NextResponse.json({ sequences: state.sequences });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = validateSequenceAction(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const state = await readState();

  if (parsed.action === "generate") {
    const lead = await findLead(parsed.leadId!);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (lead.stage === "disqualified") {
      return NextResponse.json(
        { error: "Cannot build sequence for disqualified leads (e.g. strong social presence)" },
        { status: 422 },
      );
    }
    const feedbackEntries = await listFeedback({ activeOnly: true });
    const applied = applyFeedbackToLeads([lead], feedbackEntries);
    if (applied.skipped.length) {
      return NextResponse.json(
        {
          error:
            "Lead skipped by Floor feedback learning (company/disqualifier). Disable that feedback to sequence.",
          feedbackApplication: applied.application,
        },
        { status: 422 },
      );
    }
    const existing = state.sequences.find(
      (s) => s.leadId === lead.id && s.status !== "cancelled" && s.status !== "completed",
    );
    if (existing) {
      return NextResponse.json({
        sequence: existing,
        mode: "existing",
        note: "Active sequence already exists for this lead — edit steps or mark sent.",
      });
    }
    const guidance = sequenceGuidanceFromFeedback(applied.application);
    const built = buildSequenceForLead(lead, state.bdrName, undefined, {
      feedbackGuidance: guidance || undefined,
      neverPitchTopics: applied.application.neverPitchTopics,
    });
    const saved = await addSequence(built);
    return NextResponse.json({
      sequence: saved,
      mode: "draft",
      feedbackApplication: applied.application,
      governance:
        "Draft only — Floor must approve every line (LinkedIn via HeyReach, email via Gmail) before anything sends. Any reply stops the sequence. Active feedback applied to tone/never-pitch/ICP notes.",
    });
  }

  if (parsed.action === "update_step") {
    const seq = await updateSequenceStep(parsed.sequenceId!, parsed.stepId!, {
      subject: parsed.subject,
      bodyText: parsed.bodyText,
      status: "draft",
    });
    if (!seq) return NextResponse.json({ error: "Sequence or step not found" }, { status: 404 });
    return NextResponse.json({ sequence: seq });
  }

  if (parsed.action === "approve_step") {
    const current = state.sequences
      .find((s) => s.id === parsed.sequenceId)
      ?.steps.find((s) => s.id === parsed.stepId);
    const note = parsed.bodyText ?? current?.body ?? "";
    if (current?.kind === "linkedin_connect" && note.length > LINKEDIN_CONNECT_NOTE_MAX) {
      return NextResponse.json(
        { error: `LinkedIn connect note is ${note.length} chars — max ${LINKEDIN_CONNECT_NOTE_MAX}` },
        { status: 400 },
      );
    }
    const seq = await updateSequenceStep(parsed.sequenceId!, parsed.stepId!, {
      subject: parsed.subject,
      bodyText: parsed.bodyText,
      status: "approved",
      approvedAt: new Date().toISOString(),
    });
    if (!seq) return NextResponse.json({ error: "Sequence or step not found" }, { status: 404 });
    const step = seq.steps.find((s) => s.id === parsed.stepId);
    if (step?.kind === "wait") {
      return NextResponse.json({
        error: "Wait steps are not approved for send — they are pacing only",
      }, { status: 400 });
    }
    return NextResponse.json({
      sequence: seq,
      note:
        step?.sendVia === "heyreach"
          ? "Step approved — HeyReach sends it once pushed (stub until API key). Nothing was auto-sent."
          : "Step approved — send via Gmail, then Mark sent. Nothing was auto-sent.",
    });
  }

  if (parsed.action === "mark_sent") {
    const before = state.sequences.find((s) => s.id === parsed.sequenceId);
    const step = before?.steps.find((s) => s.id === parsed.stepId);
    if (!step) return NextResponse.json({ error: "Sequence or step not found" }, { status: 404 });
    if (step.kind === "wait") {
      // Completing a wait = acknowledge delay elapsed
      const seq = await updateSequenceStep(parsed.sequenceId!, parsed.stepId!, {
        status: "sent",
        sentAt: new Date().toISOString(),
      });
      return NextResponse.json({ sequence: seq, note: "Wait acknowledged." });
    }
    if (step.status !== "approved" && step.status !== "draft") {
      // Allow mark sent from draft for flexibility, but prefer approve first
    }
    // Require approve before mark_sent for message steps (governance)
    if (step.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "Approve the step before marking sent (human-in-the-loop — no silent send)",
        },
        { status: 400 },
      );
    }
    const seq = await markSequenceStepSent(parsed.sequenceId!, parsed.stepId!);
    return NextResponse.json({
      sequence: seq,
      note: "Marked sent locally. Copy was not transmitted by this app.",
    });
  }

  if (parsed.action === "record_reply") {
    const seq = await stopSequenceOnReply(parsed.sequenceId!, parsed.replyChannel!);
    if (!seq) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    return NextResponse.json({
      sequence: seq,
      note: `Reply on ${parsed.replyChannel} — remaining LinkedIn + email steps skipped. Classify with sales-reply-demo.`,
    });
  }

  if (parsed.action === "skip_step") {
    const seq = await updateSequenceStep(parsed.sequenceId!, parsed.stepId!, {
      status: "skipped",
    });
    if (!seq) return NextResponse.json({ error: "Sequence or step not found" }, { status: 404 });
    return NextResponse.json({ sequence: seq });
  }

  return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
}
