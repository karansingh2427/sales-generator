import type { Lead, OutreachChannel, OutreachDraft } from "@/types/sales";
import { WILLOW_PITCH } from "@/lib/willow-context";
import { describeAngles, inferOpportunityAngles } from "@/lib/icp";

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

export function scoreLeadRationale(lead: Lead): string {
  const reasons: string[] = [];
  if (lead.crm?.whyGood) reasons.push(lead.crm.whyGood);
  if (lead.icpScore >= 85) reasons.push("Strong ICP fit (decision maker + expertise vertical).");
  if (lead.vertical && lead.vertical !== "other")
    reasons.push(`Vertical: ${lead.vertical}.`);
  if (
    lead.geoCode === "BE" ||
    lead.geoCode === "NL" ||
    /\b(BE|NL|Belgium|Netherlands|Brussels|Amsterdam|Antwerp|Ghent|Rotterdam)\b/i.test(
      lead.location,
    )
  )
    reasons.push("Belgium/Netherlands — core Willow market.");
  else if (/\b(LU|UK|DE|FR|IE|CH)\b/i.test(lead.location))
    reasons.push("Nearby EU — secondary to BE/NL book.");
  const angles = inferOpportunityAngles(lead);
  reasons.push(...describeAngles(angles));
  if (lead.crm?.rightContact) reasons.push(`Right contact: ${lead.crm.rightContact}.`);
  if (lead.socialPresence === "strong")
    reasons.push("Strong social presence — should be skipped.");
  if (reasons.length === 0) reasons.push("Meets baseline expertise ICP; personalize from CRM note.");
  return reasons.join(" ");
}

export function draftOutreach(
  lead: Lead,
  channel: OutreachChannel,
  bdrName: string,
): Omit<OutreachDraft, "id" | "createdAt"> {
  const name = firstName(lead.contactName);
  const rationale = scoreLeadRationale(lead);
  const opener = lead.crm?.opener?.trim();
  const angles = describeAngles(inferOpportunityAngles(lead)).slice(0, 2).join("; ");

  if (channel === "linkedin_connect") {
    return {
      leadId: lead.id,
      channel,
      body: `Hi ${name} — I help expertise firms in ${lead.location.split(",")[0]?.trim()} stay visible on LinkedIn without burning decision-maker time. ${opener ? opener.split(/[.!?]/)[0] + "." : "Worth connecting?"}

— ${bdrName}, Willow`,
      rationale,
      status: "draft",
    };
  }

  if (channel === "linkedin_dm") {
    return {
      leadId: lead.id,
      channel,
      body: `Hi ${name} — ${opener || `I noticed ${lead.firmName} may have room on LinkedIn around ${angles}.`}

Willow drafts posts in your firm's voice (EU/GDPR). Worth a 30-min live demo where we show drafts for ${lead.firmName}?

— ${bdrName}, Willow`,
      rationale,
      status: "draft",
    };
  }

  const subject = `${lead.firmName} — LinkedIn consistency without expert time?`;
  const body = `Hi ${name},

${opener || `I noticed ${lead.firmName}'s ${lead.practiceArea.toLowerCase()} work — and that keeping LinkedIn consistent usually falls on marketing (or partners) without a system.`}

Willow helps professional-services and expertise B2B firms post steadily in their own voice: quarterly calendars, drafts from a business profile, and a coach. ${WILLOW_PITCH.valueProps[0]}

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
    status: "draft",
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
  if (channel !== "email" && channel !== "linkedin_dm" && channel !== "linkedin_connect")
    return { ok: false, error: "channel must be email, linkedin_dm, or linkedin_connect" };
  return { ok: true, leadId, channel };
}
