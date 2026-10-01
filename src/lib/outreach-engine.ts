import type { Lead, OutreachChannel, OutreachDraft } from "@/types/sales";
import { WILLOW_PITCH } from "@/lib/willow-context";

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

export function scoreLeadRationale(lead: Lead): string {
  const reasons: string[] = [];
  if (lead.icpScore >= 85) reasons.push("Strong ICP fit (firm size + legal vertical).");
  if (lead.practiceArea.includes("Corporate") || lead.practiceArea.includes("Litigation"))
    reasons.push("Practice area aligns with Willow's legal case studies.");
  if (lead.location.includes("NL") || lead.location.includes("BE") || lead.location.includes("UK"))
    reasons.push("Benelux/UK — core Willow market.");
  if (lead.notes?.toLowerCase().includes("linkedin"))
    reasons.push("LinkedIn activity gap — good hook for consistency story.");
  if (reasons.length === 0) reasons.push("Meets baseline lawyer ICP; personalize from firm site.");
  return reasons.join(" ");
}

export function draftOutreach(
  lead: Lead,
  channel: OutreachChannel,
  bdrName: string,
): Omit<OutreachDraft, "id" | "createdAt"> {
  const name = firstName(lead.contactName);
  const rationale = scoreLeadRationale(lead);

  if (channel === "linkedin_dm") {
    return {
      leadId: lead.id,
      channel,
      body: `Hi ${name} — I work with law firms in ${lead.location.split(",")[0]?.trim()} on LinkedIn presence without pulling partners off billable work.

Willow drafts a quarter of posts in your firm's voice (200+ firms, EU/GDPR). Worth a 30-min live demo where we show drafts for ${lead.firmName}?

— ${bdrName}, Willow`,
      rationale,
    };
  }

  const subject = `${lead.firmName} — LinkedIn consistency without partner time?`;
  const body = `Hi ${name},

I noticed ${lead.firmName}'s ${lead.practiceArea.toLowerCase()} work — and that keeping LinkedIn consistent usually falls on marketing (or partners) without a system.

Willow helps professional-services firms post steadily in their own voice: quarterly calendars, drafts from a business profile, and a coach who knows legal. ${WILLOW_PITCH.valueProps[0]}

${WILLOW_PITCH.demoCta} Open to 30 minutes this or next week?

Best,
${bdrName}
BDR · Willow · willow.co`;

  return {
    leadId: lead.id,
    channel,
    subject,
    body,
    rationale,
  };
}

/** Invalid inputs the governance test suite expects us to reject. */
export function validateOutreachRequest(body: unknown):
  | { ok: true; channel: OutreachChannel; leadId: string }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Body must be JSON object" };
  const { leadId, channel } = body as Record<string, unknown>;
  if (typeof leadId !== "string" || !leadId.trim())
    return { ok: false, error: "leadId is required" };
  if (channel !== "email" && channel !== "linkedin_dm")
    return { ok: false, error: "channel must be email or linkedin_dm" };
  return { ok: true, leadId, channel };
}
