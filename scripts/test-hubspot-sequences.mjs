/**
 * Behavioral checks for HubSpot mock sync + multi-channel sequences.
 * Run: npm run test:hubspot
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const scriptPath = path.join(root, "scripts/_hubspot-test-run.mts");

fs.writeFileSync(
  scriptPath,
  `
import assert from "node:assert/strict";
import { mockHubSpotPayload, syncHubSpotContacts } from "../src/lib/hubspot.ts";
import {
  buildSequenceForLead,
  validateSequenceAction,
  LINKEDIN_CONNECT_NOTE_MAX,
} from "../src/lib/sequence-engine.ts";
import { buildLemlistPayload, pushToLemlist, resolveLemlistMode } from "../src/lib/lemlist.ts";
import { scoreExpertiseIcp, parseSocialPresence } from "../src/lib/icp.ts";
import { mapHubSpotStage, DEFAULT_STAGE_MAP } from "../src/lib/hubspot-config.ts";

const partner = scoreExpertiseIcp({
  title: "Partner",
  firmName: "De Clercq Advocaten",
  practiceArea: "Litigation",
  location: "Brussels, BE",
  socialPresence: "weak",
});
assert.ok(partner.score >= 80);
assert.equal(partner.vertical, "legal");

const strong = scoreExpertiseIcp({
  title: "Founder",
  firmName: "SocialPro",
  practiceArea: "Marketing",
  location: "Ghent, BE",
  socialPresence: "strong",
});
assert.equal(strong.disqualify, true);
assert.equal(parseSocialPresence("very good social"), "strong");

assert.equal(mapHubSpotStage("marketingqualifiedlead", DEFAULT_STAGE_MAP), "qualified");
assert.equal(mapHubSpotStage("Demo Booked", { "demo booked": "demo_booked" }), "demo_booked");
assert.equal(mapHubSpotStage("Demo Completed", DEFAULT_STAGE_MAP), "demo_completed");
assert.equal(mapHubSpotStage("Rescheduled", DEFAULT_STAGE_MAP), "demo_rescheduled");
assert.equal(mapHubSpotStage("Cancelled", DEFAULT_STAGE_MAP), "demo_cancelled");

const mock = mockHubSpotPayload();
assert.ok(mock.contacts.length >= 4);
assert.ok(mock.notes.every((n) => (n.companyIds?.length ?? 0) > 0), "mock notes are company-level");

const sync = await syncHubSpotContacts({ token: null });
assert.equal(sync.mode, "mock");
assert.equal(sync.upserted.length, mock.contacts.length);
assert.ok(sync.skippedStrongPresence >= 1);
assert.ok(sync.companyNotesFetched >= 1);

const els = sync.upserted.find((l) => l.contactName.includes("Els"));
assert.ok(els?.crm?.whyGood);
assert.ok(els?.crm?.opener);
assert.ok(els?.crm?.rawNote?.toLowerCase().includes("company") || els?.crm?.whyGood);
assert.equal(els?.source, "hubspot");

const joost = sync.upserted.find((l) => l.contactName.includes("Joost"));
assert.equal(joost?.geoCode, "NL");

const seq = buildSequenceForLead(els!, "Floor Hoefkens");
const emailSteps = seq.steps.filter((s) => s.kind === "email");
assert.equal(emailSteps.length, 3, "multichannel sequence caps at 3 emails");
assert.ok(seq.steps.some((s) => s.kind === "wait" && s.waitDays === 7), "emails wait ~1 week");
const msgSteps = seq.steps.filter((s) => s.kind !== "wait");
assert.deepEqual(
  msgSteps.map((s) => s.kind),
  ["linkedin_connect", "linkedin_message", "email", "email", "email"],
  "LinkedIn connect → DM → Email 1–3",
);
assert.equal(seq.steps[1].kind, "wait");
assert.equal(seq.steps[1].waitDays, 3, "DM goes out day 3");
assert.ok(msgSteps.every((s) => s.sendVia === "lemlist"), "Lemlist sends LinkedIn + email");
assert.ok(msgSteps.every((s) => s.status === "draft"), "every line starts as draft — approve first");
const connect = msgSteps[0];
assert.ok(connect.body.length <= LINKEDIN_CONNECT_NOTE_MAX, "connect note fits LinkedIn limit");
assert.ok(connect.body.includes(els.firmName));
assert.ok(msgSteps[1].body.includes("?"), "DM asks one question");
assert.ok(seq.name.includes("LinkedIn + email"));

// No LinkedIn URL → email-only, no 6-day dead wait
const noLi = buildSequenceForLead({ ...els, linkedInUrl: undefined }, "Floor Hoefkens");
assert.ok(!noLi.steps.some((s) => s.kind.startsWith("linkedin")));
assert.equal(noLi.steps[0].kind, "email");
assert.match(noLi.name, /no LinkedIn URL/);

// Lemlist stub: refuses until every line is approved, returns payload only, never "sent"
const stamp = { id: "seq_t", createdAt: "", updatedAt: "" };
const draftSeq = { ...seq, ...stamp };
assert.equal(buildLemlistPayload(els, draftSeq).ok, false, "unapproved sequence is never pushed");
const approveAll = (q) => ({
  ...q,
  steps: q.steps.map((s) => (s.kind === "wait" ? s : { ...s, status: "approved" })),
});
const linkedInOnly = {
  ...draftSeq,
  steps: draftSeq.steps.map((s) => (s.kind.startsWith("linkedin") ? { ...s, status: "approved" } : s)),
};
assert.equal(buildLemlistPayload(els, linkedInOnly).ok, false, "emails must be approved too");
const approvedSeq = approveAll(draftSeq);
const pushed = await pushToLemlist(els, approvedSeq, "", "cmp_test");
assert.equal(pushed.ok, true);
assert.equal(pushed.mode, "stub");
assert.equal(pushed.sent, false);
assert.equal(pushed.payload.campaignId, "cmp_test");
assert.equal(pushed.payload.email, els.email);
assert.equal(pushed.payload.variables.connectNote, connect.body);
assert.equal(pushed.payload.variables.linkedinMessage, msgSteps[1].body);
assert.equal(pushed.payload.variables.email1Subject, emailSteps[0].subject);
assert.equal(pushed.payload.variables.email3Body, emailSteps[2].body);
const skippedE3 = {
  ...approvedSeq,
  steps: approvedSeq.steps.map((s) => (s.id === emailSteps[2].id ? { ...s, status: "skipped" } : s)),
};
const withSkip = buildLemlistPayload(els, skippedE3);
assert.equal(withSkip.ok, true);
assert.equal(withSkip.payload.variables.email3Body, "", "skipped step sends empty copy");
assert.deepEqual(withSkip.payload.skippedSteps, [emailSteps[2].id]);
assert.equal(buildLemlistPayload({ ...els, email: "" }, approvedSeq).ok, false, "Lemlist needs an email");
assert.equal(resolveLemlistMode("key"), "live_not_wired");
const repliedSeq = { ...approvedSeq, stoppedOnReply: { channel: "linkedin", at: "" } };
assert.equal(buildLemlistPayload(els, repliedSeq).ok, false, "reply stops Lemlist push");
assert.ok(seq.steps.every((s) => s.kind === "wait" || (s.body && s.body.length > 20)));
assert.ok(seq.opportunityAngles.length > 0);
assert.ok(
  emailSteps.some((s) => s.body && /chat|curious|radar|Ludwig|intro/i.test(s.body)),
  "sequence has soft CTA / Ludwig by later touch",
);

// Story arc: vacancy note must NOT pivot to content calendar
const amelie = sync.upserted.find((l) => l.contactName.includes("Amélie") || l.firmName.includes("BrightHire"));
assert.ok(amelie, "BrightHire / Amélie mock lead present");
const vacSeq = buildSequenceForLead(amelie!, "Floor Hoefkens");
const vacE1 = vacSeq.steps.find((s) => s.kind === "email");
assert.ok(vacE1?.body);
assert.ok(!/content calendar|quarterly calendar/i.test(vacE1.body), "no random content-calendar pivot on vacancy story");
assert.ok(/hiring|vacanc|candidate|LinkedIn|visibility|trust/i.test(vacE1.body), "vacancy story stays on hiring/visibility");
const vacBodies = vacSeq.steps.filter((s) => s.kind === "email").map((s) => s.body ?? "").join("\\n");
assert.ok(/hiring|vacanc|visibility|LinkedIn/i.test(vacBodies), "emails 2–3 continue same story thread");

const bad = validateSequenceAction({ action: "mark_sent" });
assert.equal(bad.ok, false);
const gen = validateSequenceAction({ action: "generate", leadId: "hs_1" });
assert.equal(gen.ok, true);
const reply = validateSequenceAction({ action: "record_reply", sequenceId: "s1", channel: "linkedin" });
assert.equal(reply.ok, true);
assert.equal(validateSequenceAction({ action: "record_reply", sequenceId: "s1", channel: "sms" }).ok, false);

console.log("HubSpot + sequence unit checks passed");
`,
);

try {
  execSync(`npx tsx "${scriptPath}"`, { cwd: root, stdio: "inherit" });
} finally {
  try {
    fs.unlinkSync(scriptPath);
  } catch {
    /* ignore */
  }
}
