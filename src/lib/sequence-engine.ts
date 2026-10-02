import type {
  Lead,
  OutreachChannel,
  OutreachSequence,
  SequenceStep,
  SequenceStepKind,
} from "@/types/sales";
import { describeAngles, inferOpportunityAngles, type OpportunityAngle } from "@/lib/icp";
import { WILLOW_PITCH } from "@/lib/willow-context";

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

function cityHint(location: string): string {
  return location.split(",")[0]?.trim() || location;
}

function primaryAngleLine(angles: OpportunityAngle[], lead: Lead): string {
  const fromCrm = lead.crm?.opener?.trim();
  if (fromCrm) return fromCrm;
  const described = describeAngles(angles);
  return described[0] ?? "LinkedIn consistency without burning expert time";
}

function whyBlock(lead: Lead, angles: OpportunityAngle[]): string {
  const parts: string[] = [];
  if (lead.crm?.whyGood) parts.push(lead.crm.whyGood);
  parts.push(...describeAngles(angles));
  if (lead.crm?.rightContact) parts.push(`Right contact: ${lead.crm.rightContact}`);
  return parts.join(" · ");
}

function draftConnect(lead: Lead, angles: OpportunityAngle[], bdrName: string): { body: string; rationale: string } {
  const name = firstName(lead.contactName);
  const hook = primaryAngleLine(angles, lead);
  return {
    body: `Hi ${name} — I help ${lead.vertical === "legal" ? "law firms" : "expertise-driven teams"} in ${cityHint(lead.location)} stay visible on LinkedIn without pulling decision makers off billable work. ${hook.split(/[.!?]/)[0]}. Worth connecting?

— ${bdrName}, Willow`,
    rationale: whyBlock(lead, angles),
  };
}

function draftLinkedInMessage(
  lead: Lead,
  angles: OpportunityAngle[],
  bdrName: string,
  followUp = false,
): { body: string; rationale: string } {
  const name = firstName(lead.contactName);
  const hook = primaryAngleLine(angles, lead);
  const angleBits = describeAngles(angles).slice(0, 2).join("; ");
  if (followUp) {
    return {
      body: `Hi ${name} — quick follow-up. Still seeing room on ${lead.firmName}'s LinkedIn around ${angleBits}.

Willow drafts a quarter of posts in your voice (${WILLOW_PITCH.valueProps[0]}). Open to a 30-min live demo where we draft for ${lead.firmName}?

— ${bdrName}`,
      rationale: whyBlock(lead, angles),
    };
  }
  return {
    body: `Hi ${name} — ${hook}

For firms like ${lead.firmName}, the pattern is usually ${angleBits}. Willow helps without burning ${lead.title.toLowerCase().includes("partner") ? "partner" : "founder"} time — EU/GDPR hosting, coach included.

${WILLOW_PITCH.demoCta}

— ${bdrName}, Willow`,
    rationale: whyBlock(lead, angles),
  };
}

function draftEmail(
  lead: Lead,
  angles: OpportunityAngle[],
  bdrName: string,
): { subject: string; body: string; rationale: string } {
  const name = firstName(lead.contactName);
  const hook = primaryAngleLine(angles, lead);
  const subject = `${lead.firmName} — LinkedIn consistency without expert time?`;
  const body = `Hi ${name},

${hook}

I work with Belgian & Dutch expertise firms (accountancy, legal, IT, HR/search, coaching) that need to show expertise online — without pulling decision makers into content production.

Willow: quarterly calendars, drafts in your voice, coach who knows professional services. ${WILLOW_PITCH.valueProps[2]}

${WILLOW_PITCH.demoCta} Open to 30 minutes this or next week?

Best,
${bdrName}
BDR · Willow · willow.co`;
  return { subject, body, rationale: whyBlock(lead, angles) };
}

const DEFAULT_PLAYBOOK: { kind: SequenceStepKind; label: string; waitDays: number }[] = [
  { kind: "linkedin_connect", label: "LinkedIn connection request", waitDays: 0 },
  { kind: "linkedin_message", label: "LinkedIn message (or InMail)", waitDays: 0 },
  { kind: "wait", label: "Wait for reply", waitDays: 3 },
  { kind: "linkedin_followup", label: "LinkedIn follow-up", waitDays: 0 },
  { kind: "email", label: "Email follow-up", waitDays: 2 },
];

function channelFor(kind: SequenceStepKind): OutreachChannel | undefined {
  if (kind === "linkedin_connect") return "linkedin_connect";
  if (kind === "linkedin_message" || kind === "linkedin_followup") return "linkedin_dm";
  if (kind === "email") return "email";
  return undefined;
}

export function buildSequenceForLead(
  lead: Lead,
  bdrName: string,
  playbook = DEFAULT_PLAYBOOK,
): Omit<OutreachSequence, "id" | "createdAt" | "updatedAt"> {
  const angles = inferOpportunityAngles(lead);
  const steps: SequenceStep[] = playbook.map((p, i) => {
    const id = `step_${i + 1}`;
    if (p.kind === "wait") {
      return {
        id,
        kind: p.kind,
        label: `${p.label} (${p.waitDays} days)`,
        waitDays: p.waitDays,
        status: "pending" as const,
        rationale: `Pause ${p.waitDays} days — Floor’s playbook: connect/message → follow-up days later → email.`,
      };
    }
    if (p.kind === "linkedin_connect") {
      const d = draftConnect(lead, angles, bdrName);
      return {
        id,
        kind: p.kind,
        label: p.label,
        waitDays: p.waitDays,
        channel: channelFor(p.kind),
        body: d.body,
        rationale: d.rationale,
        status: "draft" as const,
      };
    }
    if (p.kind === "linkedin_followup") {
      const d = draftLinkedInMessage(lead, angles, bdrName, true);
      return {
        id,
        kind: p.kind,
        label: p.label,
        waitDays: p.waitDays,
        channel: channelFor(p.kind),
        body: d.body,
        rationale: d.rationale,
        status: "draft" as const,
      };
    }
    if (p.kind === "linkedin_message") {
      const d = draftLinkedInMessage(lead, angles, bdrName, false);
      return {
        id,
        kind: p.kind,
        label: p.label,
        waitDays: p.waitDays,
        channel: channelFor(p.kind),
        body: d.body,
        rationale: d.rationale,
        status: "draft" as const,
      };
    }
    const d = draftEmail(lead, angles, bdrName);
    return {
      id,
      kind: p.kind,
      label: p.label,
      waitDays: p.waitDays,
      channel: channelFor(p.kind),
      subject: d.subject,
      body: d.body,
      rationale: d.rationale,
      status: "draft" as const,
    };
  });

  return {
    leadId: lead.id,
    name: `LI → follow-up → email · ${lead.firmName}`,
    status: "draft",
    steps,
    opportunityAngles: angles,
  };
}

export function validateSequenceAction(body: unknown):
  | {
      ok: true;
      action: string;
      leadId?: string;
      sequenceId?: string;
      stepId?: string;
      subject?: string;
      bodyText?: string;
    }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be JSON object" };
  const b = body as Record<string, unknown>;
  const action = typeof b.action === "string" ? b.action : "";
  if (!action) return { ok: false, error: "action is required" };

  if (action === "generate") {
    if (typeof b.leadId !== "string" || !b.leadId.trim())
      return { ok: false, error: "leadId is required to generate a sequence" };
    return { ok: true, action, leadId: b.leadId };
  }

  if (action === "approve_step" || action === "mark_sent" || action === "skip_step") {
    if (typeof b.sequenceId !== "string" || !b.sequenceId.trim())
      return { ok: false, error: "sequenceId is required" };
    if (typeof b.stepId !== "string" || !b.stepId.trim())
      return { ok: false, error: "stepId is required" };
    return {
      ok: true,
      action,
      sequenceId: b.sequenceId,
      stepId: b.stepId,
      subject: typeof b.subject === "string" ? b.subject : undefined,
      bodyText: typeof b.body === "string" ? b.body : undefined,
    };
  }

  if (action === "update_step") {
    if (typeof b.sequenceId !== "string" || !b.sequenceId.trim())
      return { ok: false, error: "sequenceId is required" };
    if (typeof b.stepId !== "string" || !b.stepId.trim())
      return { ok: false, error: "stepId is required" };
    return {
      ok: true,
      action,
      sequenceId: b.sequenceId,
      stepId: b.stepId,
      subject: typeof b.subject === "string" ? b.subject : undefined,
      bodyText: typeof b.body === "string" ? b.body : undefined,
    };
  }

  return {
    ok: false,
    error:
      "Unknown action — use generate | update_step | approve_step | mark_sent | skip_step (no auto-send)",
  };
}
