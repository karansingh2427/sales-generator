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

function primaryAngleLine(angles: OpportunityAngle[], lead: Lead): string {
  const fromCrm = lead.crm?.opener?.trim();
  if (fromCrm) return fromCrm;
  const described = describeAngles(angles);
  return described[0] ?? "visibility without burning expert time";
}

function whyBlock(lead: Lead, angles: OpportunityAngle[]): string {
  const parts: string[] = [];
  if (lead.crm?.whyGood) parts.push(lead.crm.whyGood);
  parts.push(...describeAngles(angles));
  if (lead.crm?.rightContact) parts.push(`Right contact: ${lead.crm.rightContact}`);
  return parts.join(" · ");
}

type EmailTouch = 1 | 2 | 3;

function draftEmail(
  lead: Lead,
  angles: OpportunityAngle[],
  bdrName: string,
  touch: EmailTouch,
): { subject: string; body: string; rationale: string } {
  const name = firstName(lead.contactName);
  const hook = primaryAngleLine(angles, lead);
  const angleBits = describeAngles(angles).slice(0, 2).join("; ") || "visibility / consistency";
  const rationale = whyBlock(lead, angles);

  if (touch === 2) {
    return {
      subject: `Re: ${lead.firmName}`,
      body: `Hi ${name},

Quick follow-up on my note about ${lead.firmName} — still seeing room around ${angleBits}.

Happy to show how Willow helps in a short call with Ludwig if useful. If not a priority, no worries.

Best,
${bdrName}`,
      rationale,
    };
  }

  if (touch === 3) {
    return {
      subject: `Last note — ${lead.firmName}`,
      body: `Hi ${name},

Last note from me. If improving how ${lead.firmName} shows expertise online is on the radar, I can set up 30 minutes with Ludwig.

If timing is off, just say so and I’ll close the loop.

Best,
${bdrName}`,
      rationale,
    };
  }

  // Email 1 — personalized opener from HubSpot note (never invent scrape facts)
  const subject = `${lead.firmName} — ${hook.split(/[.!?]/)[0]?.slice(0, 60) || "quick thought"}`;
  const body = `Hi ${name},

${hook}

${lead.crm?.whyGood ? `${lead.crm.whyGood}\n\n` : ""}For expertise firms like yours, Willow helps with ${angleBits} without pulling decision makers into content production. ${WILLOW_PITCH.valueProps[0]}.

Open to a short intro with Ludwig?

Best,
${bdrName}
BDR · Willow`;
  return { subject, body, rationale };
}

/**
 * Floor end vision (Dutch pilot): max 3 Gmail emails.
 * Email 1 now → wait ~1 week → Email 2 → wait ~1 week → Email 3.
 * Stop early on clear no or interest (handled in skills, not this builder).
 */
const DEFAULT_PLAYBOOK: {
  kind: SequenceStepKind;
  label: string;
  waitDays: number;
  touch?: EmailTouch;
}[] = [
  { kind: "email", label: "Email 1 — opener from HubSpot note", waitDays: 0, touch: 1 },
  { kind: "wait", label: "Wait for reply (~1 week)", waitDays: 7 },
  { kind: "email", label: "Email 2 — follow-up", waitDays: 0, touch: 2 },
  { kind: "wait", label: "Wait for reply (~1 week)", waitDays: 7 },
  { kind: "email", label: "Email 3 — last note", waitDays: 0, touch: 3 },
];

function channelFor(kind: SequenceStepKind): OutreachChannel | undefined {
  if (kind === "linkedin_connect") return "linkedin_connect";
  if (kind === "linkedin_message" || kind === "linkedin_followup") return "linkedin_dm";
  if (kind === "email") return "email";
  return undefined;
}

export type BuildSequenceOptions = {
  /** Soft guidance from Floor feedback learning (tone, never-pitch, ICP notes). */
  feedbackGuidance?: string;
  neverPitchTopics?: string[];
};

function withFeedbackRationale(base: string, guidance?: string): string {
  if (!guidance?.trim()) return base;
  return `${base} · Floor feedback: ${guidance.trim()}`;
}

function scrubBody(body: string, topics?: string[]): string {
  if (!topics?.length) return body;
  let out = body;
  for (const topic of topics) {
    const trimmed = topic.trim();
    if (trimmed.length < 3) continue;
    const re = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, "[omitted per Floor feedback]");
  }
  return out;
}

export function buildSequenceForLead(
  lead: Lead,
  bdrName: string,
  playbook = DEFAULT_PLAYBOOK,
  options: BuildSequenceOptions = {},
): Omit<OutreachSequence, "id" | "createdAt" | "updatedAt"> {
  const angles = inferOpportunityAngles(lead);
  const guidance = options.feedbackGuidance;
  const neverPitch = options.neverPitchTopics;
  let emailTouch = 1 as EmailTouch;

  const steps: SequenceStep[] = playbook.map((p, i) => {
    const id = `step_${i + 1}`;
    if (p.kind === "wait") {
      return {
        id,
        kind: p.kind,
        label: `${p.label}`,
        waitDays: p.waitDays,
        status: "pending" as const,
        rationale: withFeedbackRationale(
          `Pause ~${p.waitDays} days (~1 week). Cap 3 emails. Stop early on clear no or interest → Slack Floor.`,
          guidance,
        ),
      };
    }
    if (p.kind === "email") {
      const touch = (p.touch ?? emailTouch) as EmailTouch;
      emailTouch = Math.min(3, (touch + 1) as EmailTouch) as EmailTouch;
      const d = draftEmail(lead, angles, bdrName, touch);
      return {
        id,
        kind: p.kind,
        label: p.label,
        waitDays: p.waitDays,
        channel: channelFor(p.kind),
        subject: d.subject,
        body: scrubBody(d.body, neverPitch),
        rationale: withFeedbackRationale(d.rationale, guidance),
        status: "draft" as const,
      };
    }
    // LinkedIn kinds kept for type compat — not in Dutch pilot playbook.
    return {
      id,
      kind: p.kind,
      label: p.label,
      waitDays: p.waitDays,
      channel: channelFor(p.kind),
      body: scrubBody(
        `(Not used in Dutch pilot — Gmail only.) Contact ${firstName(lead.contactName)} at ${lead.firmName}.`,
        neverPitch,
      ),
      rationale: withFeedbackRationale(whyBlock(lead, angles), guidance),
      status: "draft" as const,
    };
  });

  return {
    leadId: lead.id,
    name: `Gmail cold sequence (max 3) · ${lead.firmName}`,
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
      "Unknown action — use generate | update_step | approve_step | mark_sent | skip_step (Gmail send only after approve)",
  };
}
