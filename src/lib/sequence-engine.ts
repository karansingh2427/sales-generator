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
 * Senior sales voice: calm, specific, peer-to-peer. The default playbook sends ONE email
 * (touch 1); touches 2–3 remain for custom playbooks. Soft CTA — never a demo/feature dump.
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
${bdrName}${lead.linkedInUrl?.trim() ? "\n\nPS — I also sent you a connection request on LinkedIn." : ""}`;

  return { subject: arc.subjectHint, body, rationale };
}

/** Lemlist caps invite notes at 200 characters, variables included (some Premium senders get 300). */
export const LINKEDIN_CONNECT_NOTE_MAX = 200;

/** Automatic LinkedIn actions — Lemlist runs them, there is no copy for Floor to approve. */
export function isActionStep(kind: SequenceStepKind): boolean {
  return kind === "linkedin_visit" || kind === "linkedin_like";
}

/** Steps with copy Floor must approve before anything is sent. */
export function needsApproval(step: Pick<SequenceStep, "kind">): boolean {
  return step.kind !== "wait" && !isActionStep(step.kind);
}

/** Short noun phrase for the angle — LinkedIn copy has no room for the full insight. */
const ANGLE_PHRASE: Record<StoryArc["angle"], string> = {
  open_vacancies: "hiring visibility",
  visibility: "online visibility",
  consistency: "steady posting",
  content_quality: "firm voice online",
  content_mix: "POV vs promo posts",
};

/** Why we're also reaching out on LinkedIn — the same story as the email, in one clause. */
const ANGLE_REASON: Record<StoryArc["angle"], (firm: string) => string> = {
  open_vacancies: (firm) => `${firm} is hiring, and the story around those roles matters on LinkedIn`,
  visibility: (firm) => `there’s more expertise at ${firm} than shows online`,
  consistency: (firm) => `I see ${firm} hasn’t been posting consistently`,
  content_quality: (firm) => `the posts don’t yet sound like the people at ${firm}`,
  content_mix: (firm) => `there’s room for more of ${firm}’s own point of view in its posts`,
};

/** One easy question per angle — never a pitch. */
const ANGLE_QUESTION: Record<StoryArc["angle"], (firm: string) => string> = {
  open_vacancies: (firm) => `How does ${firm} tell the story behind its open roles today?`,
  visibility: (firm) => `Who at ${firm} owns LinkedIn visibility today?`,
  consistency: () => `How much time does the team spend on posts each week?`,
  content_quality: (firm) => `Who writes ${firm}’s posts today?`,
  content_mix: () => `How do you decide what the firm posts about?`,
};

const ON_ACCEPT = "As soon as they’ve accepted your invite (Lemlist waits up to 14 days) — only if they haven’t replied";
const AFTER_ACCEPT = "Only if they accepted your invite and haven’t replied";

/**
 * LinkedIn copy (sent by Lemlist): short, personal, peer-to-peer.
 * Invite note ≤200 chars; messages 2–3 lines. Same story thread as the email.
 */
function draftLinkedIn(
  lead: Lead,
  arc: StoryArc,
  bdrName: string,
  kind: "linkedin_connect" | "linkedin_message" | "linkedin_followup",
): string {
  const name = firstName(lead.contactName);
  const me = firstName(bdrName);
  const phrase = ANGLE_PHRASE[arc.angle];
  if (kind === "linkedin_connect") {
    const options = [
      `Hi ${name}, I came across ${lead.firmName} while looking at ${phrase} at expertise firms. I work on exactly that at Willow — would be good to connect. ${me}`,
      `Hi ${name}, I work with expertise firms like ${lead.firmName} on ${phrase}. Would be good to connect. ${me}`,
      `Hi ${name}, I work with expertise firms on ${phrase}. Would be good to connect. ${me}`,
    ];
    return options.find((o) => o.length <= LINKEDIN_CONNECT_NOTE_MAX) ?? options[options.length - 1];
  }
  if (kind === "linkedin_message") {
    return `Thanks for connecting, ${name}! I also sent you an email — reaching out here as well because ${ANGLE_REASON[arc.angle](lead.firmName)}.
${ANGLE_QUESTION[arc.angle](lead.firmName)}`;
  }
  return `Hi ${name}, one more thought on ${lead.firmName}:
${arc.tension}
Worth a short chat — or is the timing off?`;
}

type PlaybookStep = {
  kind: SequenceStepKind;
  label: string;
  waitDays: number;
  touch?: EmailTouch;
  condition?: string;
};

/**
 * Lemlist multichannel (Floor, Nov 2026): warm up on LinkedIn, one personal email,
 * then the follow-ups happen on LinkedIn — more personal than more emails.
 * Matches the live "Willow NL pilot" campaign (Lemlist only counts whole days):
 * visit profile → like latest post → invite → the one email, all on day 0 in Lemlist's send queue
 * → LinkedIn message as soon as the invite is accepted → LinkedIn follow-up 2 days later.
 * Any reply on either channel stops the rest. Every written line needs Floor's approval.
 */
const DEFAULT_PLAYBOOK: PlaybookStep[] = [
  { kind: "linkedin_visit", label: "Visit their LinkedIn profile", waitDays: 0 },
  { kind: "linkedin_like", label: "Like their latest post", waitDays: 0 },
  { kind: "linkedin_connect", label: "Connection request + short note", waitDays: 0 },
  { kind: "email", label: "Email — why we’re reaching out, from the HubSpot note", waitDays: 0, touch: 1 },
  { kind: "linkedin_message", label: "LinkedIn message — “I also sent you an email…”", waitDays: 0, condition: ON_ACCEPT },
  { kind: "wait", label: "Wait 2 days → LinkedIn follow-up", waitDays: 2 },
  { kind: "linkedin_followup", label: "LinkedIn follow-up", waitDays: 0, condition: AFTER_ACCEPT },
];

/** No LinkedIn URL on the lead → no LinkedIn steps; just the one email. */
const EMAIL_ONLY_PLAYBOOK = DEFAULT_PLAYBOOK.filter((p) => p.kind === "email");

function channelFor(kind: SequenceStepKind): OutreachChannel | undefined {
  if (kind === "linkedin_connect") return "linkedin_connect";
  if (kind === "linkedin_message" || kind === "linkedin_followup") return "linkedin_dm";
  if (kind === "email") return "email";
  return undefined;
}

function sendViaFor(kind: SequenceStepKind): SendProvider | undefined {
  return kind === "wait" ? undefined : "lemlist";
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
  playbookOverride?: PlaybookStep[],
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
          `Pause ${p.waitDays} day${p.waitDays === 1 ? "" : "s"}. The next step goes out only if there is no reply on LinkedIn or email. Any reply → stop the sequence (record_reply) → classify / Slack Floor.`,
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
    if (isActionStep(p.kind)) {
      return {
        id,
        kind: p.kind,
        label: p.label,
        waitDays: p.waitDays,
        sendVia: sendViaFor(p.kind),
        rationale: "Automatic in Lemlist — warms the lead up before the invite. Skip it if it doesn’t fit this person.",
        status: "pending" as const,
      };
    }
    const liKind =
      p.kind === "linkedin_connect" || p.kind === "linkedin_followup" ? p.kind : "linkedin_message";
    return {
      id,
      kind: p.kind,
      label: p.label,
      waitDays: p.waitDays,
      channel: channelFor(p.kind),
      sendVia: sendViaFor(p.kind),
      condition: p.condition,
      body: scrubBody(draftLinkedIn(lead, arc, bdrName, liKind), neverPitch),
      rationale: withFeedbackRationale(whyBlock(lead, arc), guidance),
      status: "draft" as const,
    };
  });

  return {
    leadId: lead.id,
    name: hasLinkedIn || playbookOverride
      ? `LinkedIn + email sequence · ${lead.firmName}`
      : `Email only (no LinkedIn URL) · ${lead.firmName}`,
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
      "Unknown action — use generate | update_step | approve_step | mark_sent | skip_step | record_reply (Lemlist send only after approve)",
  };
}
