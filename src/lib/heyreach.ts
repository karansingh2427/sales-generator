import type { Lead, OutreachSequence, SequenceStep } from "@/types/sales";

/**
 * HeyReach (LinkedIn) push — STUB until Willow's HeyReach API key is set.
 *
 * HeyReach sends the LinkedIn steps (connect note + DM); Gmail sends the emails.
 * Only Floor-approved LinkedIn steps are ever pushed. With no key we return the
 * exact payload that would be sent so Floor can review it; with a key we still
 * refuse until the real campaign call is wired (see skills/sales-heyreach-push).
 */

export type HeyReachMode = "stub" | "live_not_wired";

export type HeyReachLeadPayload = {
  linkedInUrl: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email?: string;
  /** Approved copy per step, in sequence order. */
  messages: { stepId: string; kind: "connect_note" | "message"; body: string }[];
};

export type HeyReachPushResult =
  | { ok: true; mode: HeyReachMode; sent: false; payload: HeyReachLeadPayload; note: string }
  | { ok: false; error: string };

export function resolveHeyReachMode(apiKey: string | undefined | null): HeyReachMode {
  return apiKey?.trim() ? "live_not_wired" : "stub";
}

function isLinkedInStep(step: SequenceStep): boolean {
  return step.sendVia === "heyreach";
}

export function buildHeyReachPayload(
  lead: Lead,
  sequence: OutreachSequence,
): HeyReachPushResult {
  if (sequence.stoppedOnReply) {
    return { ok: false, error: "Lead already replied — sequence stopped, nothing to push" };
  }
  if (!lead.linkedInUrl?.trim()) {
    return { ok: false, error: "Lead has no LinkedIn URL — HeyReach can't reach them" };
  }
  const liSteps = sequence.steps.filter(isLinkedInStep);
  if (!liSteps.length) {
    return { ok: false, error: "Sequence has no LinkedIn steps" };
  }
  const pending = liSteps.filter((s) => s.status !== "skipped" && s.status !== "sent");
  const unapproved = pending.filter((s) => s.status !== "approved");
  if (unapproved.length) {
    return {
      ok: false,
      error: `Approve every LinkedIn step before pushing to HeyReach (unapproved: ${unapproved
        .map((s) => s.id)
        .join(", ")})`,
    };
  }
  if (!pending.length) {
    return { ok: false, error: "No approved LinkedIn steps left to push" };
  }
  const [firstName, ...rest] = lead.contactName.trim().split(/\s+/);
  return {
    ok: true,
    mode: "stub",
    sent: false,
    note: "",
    payload: {
      linkedInUrl: lead.linkedInUrl.trim(),
      firstName: firstName ?? "",
      lastName: rest.join(" "),
      companyName: lead.firmName,
      email: lead.email || undefined,
      messages: pending.map((s) => ({
        stepId: s.id,
        kind: s.kind === "linkedin_connect" ? "connect_note" : "message",
        body: s.body ?? "",
      })),
    },
  };
}

export async function pushToHeyReach(
  lead: Lead,
  sequence: OutreachSequence,
  apiKey = process.env.HEYREACH_API_KEY,
): Promise<HeyReachPushResult> {
  const built = buildHeyReachPayload(lead, sequence);
  if (!built.ok) return built;
  const mode = resolveHeyReachMode(apiKey);
  return {
    ...built,
    mode,
    note:
      mode === "stub"
        ? "HEYREACH_API_KEY not set — stub only. Payload shown for review; nothing was sent to LinkedIn."
        : "HEYREACH_API_KEY is set but the HeyReach campaign call is not wired yet — nothing was sent.",
  };
}
