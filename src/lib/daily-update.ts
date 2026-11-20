import type { OutreachSequence, ReplyChannel, WorkspaceState } from "@/types/sales";

/**
 * Floor's weekday 09:00 (Europe/Amsterdam) update: what went out since the last
 * update, replies, reply rate, what waits for her approval — short enough for Slack.
 * Invite acceptance lives in Lemlist; the Cowork skill adds it once Lemlist is connected.
 */

export const UPDATE_TIMEZONE = "Europe/Amsterdam";

export type DailyUpdate = {
  from: string;
  to: string;
  sent: { invites: number; emails: number; linkedinMessages: number };
  replies: { total: number; linkedin: number; email: number; leads: { firm: string; contact: string; channel: ReplyChannel }[] };
  pilot: { contacted: number; replied: number; replyRate: number };
  awaitingApproval: number;
  demosBooked: number;
  text: string;
};

function weekdayIn(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone }).format(date);
}

/** Since the previous weekday's update: 3 days back on Monday, otherwise 1. */
export function updateWindowStart(now: Date): Date {
  const days = weekdayIn(now, UPDATE_TIMEZONE) === "Mon" ? 3 : 1;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function inWindow(iso: string | undefined, from: Date, to: Date): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  return t > from.getTime() && t <= to.getTime();
}

function wasContacted(seq: OutreachSequence): boolean {
  return seq.steps.some((s) => s.kind !== "wait" && s.status === "sent");
}

function percent(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0;
}

export function buildDailyUpdate(
  state: Pick<WorkspaceState, "leads" | "sequences" | "bookings">,
  now = new Date(),
): DailyUpdate {
  const from = updateWindowStart(now);
  const leadById = new Map(state.leads.map((l) => [l.id, l]));

  const sent = { invites: 0, emails: 0, linkedinMessages: 0 };
  for (const seq of state.sequences) {
    for (const s of seq.steps) {
      if (s.status !== "sent" || !inWindow(s.sentAt, from, now)) continue;
      if (s.kind === "linkedin_connect") sent.invites += 1;
      else if (s.kind === "email") sent.emails += 1;
      else if (s.kind === "linkedin_message" || s.kind === "linkedin_followup") sent.linkedinMessages += 1;
    }
  }

  const replied = state.sequences.filter((s) => inWindow(s.stoppedOnReply?.at, from, now));
  const replyLeads = replied.map((s) => {
    const lead = leadById.get(s.leadId);
    return {
      firm: lead?.firmName ?? s.leadId,
      contact: lead?.contactName ?? "",
      channel: s.stoppedOnReply!.channel,
    };
  });

  const contacted = state.sequences.filter(wasContacted).length;
  const repliedTotal = state.sequences.filter((s) => s.stoppedOnReply).length;
  const awaitingApproval = state.sequences.filter(
    (s) => !s.stoppedOnReply && s.status !== "cancelled" && s.steps.some((st) => st.status === "draft"),
  ).length;
  const demosBooked = state.bookings.filter((b) => inWindow(b.createdAt, from, now)).length;

  const update: Omit<DailyUpdate, "text"> = {
    from: from.toISOString(),
    to: now.toISOString(),
    sent,
    replies: {
      total: replied.length,
      linkedin: replyLeads.filter((r) => r.channel === "linkedin").length,
      email: replyLeads.filter((r) => r.channel === "email").length,
      leads: replyLeads,
    },
    pilot: { contacted, replied: repliedTotal, replyRate: percent(repliedTotal, contacted) },
    awaitingApproval,
    demosBooked,
  };
  return { ...update, text: formatDailyUpdate(update, now) };
}

export function formatDailyUpdate(u: Omit<DailyUpdate, "text">, now: Date): string {
  const day = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: UPDATE_TIMEZONE,
  }).format(now);
  const since = weekdayIn(now, UPDATE_TIMEZONE) === "Mon" ? "since Friday" : "since yesterday";
  const lines = [
    `☀️ Outreach update — ${day} (${since})`,
    `Sent: ${u.sent.invites} invites · ${u.sent.emails} emails · ${u.sent.linkedinMessages} LinkedIn messages`,
    `Replies: ${u.replies.total}${u.replies.total ? ` (${u.replies.linkedin} LinkedIn · ${u.replies.email} email)` : ""}`,
    ...u.replies.leads.map((r) => `  • ${r.contact ? `${r.contact}, ` : ""}${r.firm} — ${r.channel}`),
    `Pilot so far: ${u.pilot.contacted} contacted · ${u.pilot.replied} replied (${u.pilot.replyRate}%)`,
    `Demos booked: ${u.demosBooked} · Waiting for your approval: ${u.awaitingApproval} leads`,
  ];
  return lines.join("\n");
}
