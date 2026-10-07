import type {
  Lead,
  OutreachChannel,
  OutreachSequence,
  SequenceStep,
  SequenceStepKind,
} from "@/types/sales";
import { inferOpportunityAngles } from "@/lib/icp";
import { buildStoryArc, type StoryArc } from "@/lib/story-arc";

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

function whyBlock(lead: Lead, arc: StoryArc): string {
  const parts: string[] = [`Story: ${arc.angle}`];
  if (lead.crm?.whyGood) parts.push(lead.crm.whyGood);
  parts.push(arc.insight);
  if (lead.crm?.rightContact) parts.push(`Right contact: ${lead.crm.rightContact}`);
  return parts.join(" · ");
}

type EmailTouch = 1 | 2 | 3;

/**
 * Senior sales voice: calm, specific, peer-to-peer.
 * One story thread across Email 1–3. Soft CTA — never a demo/feature dump in E1.
 */
function draftEmail(
  lead: Lead,
  arc: StoryArc,
  bdrName: string,
  touch: EmailTouch,
): { subject: string; body: string; rationale: string } {
  const name = firstName(lead.contactName);
  const rationale = whyBlock(lead, arc);

  if (touch === 2) {
    return {
      subject: `Re: ${arc.subjectHint}`,
      body: `Hi ${name},

Circling back briefly on ${lead.firmName} — still thinking about ${arc.insight.replace(/\.$/, "")}.

${arc.tension}

If useful to compare notes, I’m happy to. If not a priority, no worries at all.

Best,
${bdrName}`,
      rationale,
    };
  }

  if (touch === 3) {
    return {
      subject: `Last note — ${lead.firmName}`,
      body: `Hi ${name},

Last note from me on this. If the ${arc.angle === "open_vacancies" ? "hiring / visibility" : arc.angle.replace(/_/g, " ")} angle for ${lead.firmName} is on your radar, I’m glad to continue the conversation — or introduce Ludwig for a short chat.

If timing is off, just say so and I’ll close the loop.

Best,
${bdrName}`,
      rationale,
    };
  }

  // Email 1 — insight → one tension → soft Willow bridge (same story) → short CTA
  const body = `Hi ${name},

${arc.insight}

${arc.tension}

${arc.willowBridge}

Curious whether this is on your radar — open to a short chat if useful.

Best,
${bdrName}`;

  return { subject: arc.subjectHint, body, rationale };
}

/**
 * Floor Dutch pilot: max 3 Gmail emails.
 * Email 1 now → wait ~1 week → Email 2 → wait ~1 week → Email 3.
 * Same story arc on every touch. Stop early on clear no or interest (skills).
 */
const DEFAULT_PLAYBOOK: {
  kind: SequenceStepKind;
  label: string;
  waitDays: number;
  touch?: EmailTouch;
}[] = [
  { kind: "email", label: "Email 1 — HubSpot insight → one story", waitDays: 0, touch: 1 },
  { kind: "wait", label: "Wait exactly 7 days (if no reply) → Email 2 auto-scheduled", waitDays: 7 },
  { kind: "email", label: "Email 2 — same story (+7d if no reply)", waitDays: 0, touch: 2 },
  { kind: "wait", label: "Wait exactly 7 days (if no reply) → Email 3 auto-scheduled", waitDays: 7 },
  { kind: "email", label: "Email 3 — same story (+14d if no reply)", waitDays: 0, touch: 3 },
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
  const arc = buildStoryArc(lead);
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
          `Pause exactly ${p.waitDays} days. Auto-schedule next email (Gmail schedule or Cowork reminder). Cap 3. Cancel on reply → stop or Slack Floor.`,
          guidance,
        ),
      };
    }
    if (p.kind === "email") {
      const touch = (p.touch ?? emailTouch) as EmailTouch;
      emailTouch = Math.min(3, (touch + 1) as EmailTouch) as EmailTouch;
      const d = draftEmail(lead, arc, bdrName, touch);
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
      rationale: withFeedbackRationale(whyBlock(lead, arc), guidance),
      status: "draft" as const,
    };
  });

  return {
    leadId: lead.id,
    name: `Gmail cold sequence (max 3) · ${lead.firmName}`,
    status: "draft",
    steps,
    opportunityAngles: angles.length ? [arc.angle, ...angles.filter((a) => a !== arc.angle)] : [arc.angle],
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
