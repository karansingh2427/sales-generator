import type { Lead, OutreachChannel, OutreachDraft } from "@/types/sales";
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
    lead.geoCode === "NL" ||
    /\b(NL|Netherlands|Amsterdam|Rotterdam|Utrecht|Eindhoven)\b/i.test(lead.location)
  )
    reasons.push("Netherlands — primary ICP market.");
  else if (
    lead.geoCode === "BE" ||
    /\b(BE|Belgium|Brussels|Antwerp|Ghent|Gent|Leuven)\b/i.test(lead.location)
  )
    reasons.push("Belgium — secondary ICP market.");
  else reasons.push("Out of scope — NL + BE only.");
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

Willow drafts posts in your firm's voice (EU/GDPR). Worth a 30-min live demo? We book on the AE’s calendar link (same as our usual demo handoff).

— ${bdrName}, Willow`,
      rationale,
      status: "draft",
    };
  }

  const subject = `${lead.firmName} — a quick thought`;
  const body = `Hi ${name},

${opener || `I noticed ${lead.firmName}'s ${lead.practiceArea.toLowerCase()} work — and that how you show up online may not match the expertise you deliver.`}

Worth a short chat if useful — happy to compare notes.

Best,
${bdrName}`;

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
