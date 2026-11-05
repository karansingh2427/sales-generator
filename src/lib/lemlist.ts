import type { Lead, OutreachSequence, SequenceStep } from "@/types/sales";

/**
 * Lemlist push — STUB until Willow's Lemlist API key is set.
 *
 * Lemlist sends the whole sequence: LinkedIn steps (connect note + DM) and the
 * emails (from Floor's inbox connected inside Lemlist), and stops on reply.
 * Lemlist campaign steps are shared templates, so each lead carries its own
 * Floor-approved copy as custom variables ({{connectNote}}, {{email1Body}}, …).
 *
 * Only fully approved sequences are ever pushed. With no key we return the exact
 * lead payload so Floor can review it; with a key we still refuse until the real
 * add-lead-to-campaign call is wired (see skills/sales-lemlist-push).
 */

export type LemlistMode = "stub" | "live_not_wired";

export type LemlistLeadPayload = {
  campaignId: string | null;
  /** Lemlist identifies a campaign lead by email. */
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  linkedinUrl?: string;
  /** Approved copy per step, referenced as {{name}} in the Lemlist campaign. */
  variables: Record<string, string>;
  /** Step ids Floor skipped — their variables are empty; the campaign must skip them. */
  skippedSteps: string[];
};

export type LemlistPushResult =
  | { ok: true; mode: LemlistMode; sent: false; payload: LemlistLeadPayload; note: string }
  | { ok: false; error: string };

export function resolveLemlistMode(apiKey: string | undefined | null): LemlistMode {
  return apiKey?.trim() ? "live_not_wired" : "stub";
}

function isMessageStep(step: SequenceStep): boolean {
  return step.kind !== "wait";
}

/** Variable names used in the Lemlist campaign template, in sequence order. */
function variablesFor(steps: SequenceStep[]): Record<string, string> {
  const vars: Record<string, string> = {};
  let email = 0;
  for (const s of steps) {
    const body = s.status === "skipped" ? "" : (s.body ?? "");
    if (s.kind === "linkedin_connect") vars.connectNote = body;
    else if (s.kind === "email") {
      email += 1;
      vars[`email${email}Subject`] = s.status === "skipped" ? "" : (s.subject ?? "");
      vars[`email${email}Body`] = body;
    } else vars.linkedinMessage = body;
  }
  return vars;
}

export function buildLemlistPayload(
  lead: Lead,
  sequence: OutreachSequence,
  campaignId: string | null = null,
): LemlistPushResult {
  if (sequence.stoppedOnReply) {
    return { ok: false, error: "Lead already replied — sequence stopped, nothing to push" };
  }
  if (!lead.email?.trim()) {
    return { ok: false, error: "Lead has no email address — Lemlist needs one to add the lead" };
  }
  const steps = sequence.steps.filter(isMessageStep);
  const live = steps.filter((s) => s.status !== "skipped");
  if (!live.length) {
    return { ok: false, error: "Every step is skipped — nothing to push" };
  }
  if (live.some((s) => s.status === "sent")) {
    return { ok: false, error: "Part of this sequence was already sent — push it only once, before anything goes out" };
  }
  const unapproved = live.filter((s) => s.status !== "approved");
  if (unapproved.length) {
    return {
      ok: false,
      error: `Approve every line before sending to Lemlist (unapproved: ${unapproved
        .map((s) => s.id)
        .join(", ")})`,
    };
  }
  const [firstName, ...rest] = lead.contactName.trim().split(/\s+/);
  return {
    ok: true,
    mode: "stub",
    sent: false,
    note: "",
    payload: {
      campaignId,
      email: lead.email.trim(),
      firstName: firstName ?? "",
      lastName: rest.join(" "),
      companyName: lead.firmName,
      linkedinUrl: lead.linkedInUrl?.trim() || undefined,
      variables: variablesFor(steps),
      skippedSteps: steps.filter((s) => s.status === "skipped").map((s) => s.id),
    },
  };
}

export async function pushToLemlist(
  lead: Lead,
  sequence: OutreachSequence,
  apiKey = process.env.LEMLIST_API_KEY,
  campaignId = process.env.LEMLIST_CAMPAIGN_ID?.trim() || null,
): Promise<LemlistPushResult> {
  const built = buildLemlistPayload(lead, sequence, campaignId);
  if (!built.ok) return built;
  const mode = resolveLemlistMode(apiKey);
  return {
    ...built,
    mode,
    note:
      mode === "stub"
        ? "LEMLIST_API_KEY not set — stub only. Payload shown for review; nothing was sent."
        : "LEMLIST_API_KEY is set but the Lemlist campaign call is not wired yet — nothing was sent.",
  };
}
