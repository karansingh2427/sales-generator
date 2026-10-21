import type {
  Lead,
  OutreachChannel,
  OutreachSequence,
  SequenceStep,
  SequenceStepKind,
  ReplyChannel,
  SendProvider,
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

/** LinkedIn caps connection notes at 300 characters. */
export const LINKEDIN_CONNECT_NOTE_MAX = 300;

/** Short noun phrase for the angle — LinkedIn copy has no room for the full insight. */
const ANGLE_PHRASE: Record<StoryArc["angle"], string> = {
  open_vacancies: "hiring visibility",
  visibility: "online visibility",
  consistency: "steady posting",
  content_quality: "firm voice online",
  content_mix: "POV vs promo posts",
};

/** One easy question per angle — Reachium-style opener, never a pitch. */
const ANGLE_QUESTION: Record<StoryArc["angle"], (firm: string) => string> = {
  open_vacancies: (firm) => `How does ${firm} tell the story behind its open roles today?`,
  visibility: (firm) => `Who at ${firm} owns LinkedIn visibility today?`,
  consistency: () => `How much time does the team spend on posts each week?`,
  content_quality: (firm) => `Who writes ${firm}’s posts today?`,
  content_mix: () => `How do you decide what the firm posts about?`,
};

/**
 * LinkedIn copy via HeyReach: short, peer-to-peer, one question.
 * Connect note ≤300 chars; DM is 2–3 lines. Same story thread as the emails.
 */
function draftLinkedIn(
  lead: Lead,
  arc: StoryArc,
  bdrName: string,
  kind: "linkedin_connect" | "linkedin_message",
): string {
  const name = firstName(lead.contactName);
  const me = firstName(bdrName);
  if (kind === "linkedin_connect") {
    const note = `Hi ${name}, I came across ${lead.firmName} while looking at ${ANGLE_PHRASE[arc.angle]} at expertise firms. I work on exactly that at Willow — would be good to connect. ${me}`;
    return note.length <= LINKEDIN_CONNECT_NOTE_MAX
      ? note
      : `Hi ${name}, I work with expertise firms like ${lead.firmName} on ${ANGLE_PHRASE[arc.angle]}. Would be good to connect. ${me}`;
  }
  return `Thanks for connecting, ${name}.
${arc.tension}
${ANGLE_QUESTION[arc.angle](lead.firmName)}`;
}

/**
 * HeyReach + Gmail multichannel (Floor, Oct 2026):
 * LinkedIn connect (day 0) → LinkedIn DM (day 3) → Email 1 (day 6) → Email 2 (day 13) → Email 3 (day 20).
 * Max 3 emails. Same story arc on every touch. Any reply on either channel stops the rest.
 * Every message step needs Floor's approval before HeyReach / Gmail sends it.
 */
const DEFAULT_PLAYBOOK: {
  kind: SequenceStepKind;
  label: string;
  waitDays: number;
  touch?: EmailTouch;
}[] = [
  { kind: "linkedin_connect", label: "LinkedIn connect + note (HeyReach)", waitDays: 0 },
  { kind: "wait", label: "Wait 3 days (if no reply) → LinkedIn DM", waitDays: 3 },
  { kind: "linkedin_message", label: "LinkedIn DM — one question (HeyReach, day 3)", waitDays: 0 },
  { kind: "wait", label: "Wait 3 days (if no reply) → Email 1", waitDays: 3 },
  { kind: "email", label: "Email 1 — HubSpot insight → one story (Gmail, day 6)", waitDays: 0, touch: 1 },
  { kind: "wait", label: "Wait exactly 7 days (if no reply) → Email 2", waitDays: 7 },
  { kind: "email", label: "Email 2 — same story (Gmail, day 13)", waitDays: 0, touch: 2 },
  { kind: "wait", label: "Wait exactly 7 days (if no reply) → Email 3", waitDays: 7 },
  { kind: "email", label: "Email 3 — same story, last note (Gmail, day 20)", waitDays: 0, touch: 3 },
];

/** No LinkedIn URL on the lead → HeyReach can't reach them; run the email part straight away. */
const EMAIL_ONLY_PLAYBOOK = DEFAULT_PLAYBOOK.filter(
  (p, i) => i >= DEFAULT_PLAYBOOK.findIndex((x) => x.kind === "email"),
);

function channelFor(kind: SequenceStepKind): OutreachChannel | undefined {
  if (kind === "linkedin_connect") return "linkedin_connect";
  if (kind === "linkedin_message" || kind === "linkedin_followup") return "linkedin_dm";
  if (kind === "email") return "email";
  return undefined;
}

function sendViaFor(kind: SequenceStepKind): SendProvider | undefined {
  if (kind === "email") return "gmail";
  if (kind === "wait") return undefined;
  return "heyreach";
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
  playbookOverride?: typeof DEFAULT_PLAYBOOK,
  options: BuildSequenceOptions = {},
): Omit<OutreachSequence, "id" | "createdAt" | "updatedAt"> {
  const hasLinkedIn = Boolean(lead.linkedInUrl?.trim());
  const playbook = playbookOverride ?? (hasLinkedIn ? DEFAULT_PLAYBOOK : EMAIL_ONLY_PLAYBOOK);
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
          `Pause exactly ${p.waitDays} days. Next step goes out only if no reply on LinkedIn or email. Any reply → stop the sequence (record_reply) → classify / Slack Floor.`,
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
        sendVia: sendViaFor(p.kind),
        subject: d.subject,
        body: scrubBody(d.body, neverPitch),
        rationale: withFeedbackRationale(d.rationale, guidance),
        status: "draft" as const,
      };
    }
    const liKind = p.kind === "linkedin_connect" ? "linkedin_connect" : "linkedin_message";
    return {
      id,
      kind: p.kind,
      label: p.label,
      waitDays: p.waitDays,
      channel: channelFor(p.kind),
      sendVia: sendViaFor(p.kind),
      body: scrubBody(draftLinkedIn(lead, arc, bdrName, liKind), neverPitch),
      rationale: withFeedbackRationale(whyBlock(lead, arc), guidance),
      status: "draft" as const,
    };
  });

  return {
    leadId: lead.id,
    name: hasLinkedIn || playbookOverride
      ? `HeyReach + Gmail sequence · ${lead.firmName}`
      : `Gmail sequence (no LinkedIn URL) · ${lead.firmName}`,
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
      replyChannel?: ReplyChannel;
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

  if (action === "record_reply") {
    if (typeof b.sequenceId !== "string" || !b.sequenceId.trim())
      return { ok: false, error: "sequenceId is required" };
    if (b.channel !== "linkedin" && b.channel !== "email")
      return { ok: false, error: "channel must be linkedin | email" };
    return { ok: true, action, sequenceId: b.sequenceId, replyChannel: b.channel };
  }

  return {
    ok: false,
    error:
      "Unknown action — use generate | update_step | approve_step | mark_sent | skip_step | record_reply (HeyReach / Gmail send only after approve)",
  };
}
