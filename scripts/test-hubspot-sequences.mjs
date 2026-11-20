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
  isActionStep,
  needsApproval,
} from "../src/lib/sequence-engine.ts";
import { buildLemlistPayload, pushToLemlist, resolveLemlistMode } from "../src/lib/lemlist.ts";
import { buildDailyUpdate, updateWindowStart } from "../src/lib/daily-update.ts";
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
assert.equal(emailSteps.length, 1, "one personal email — follow-ups happen on LinkedIn");
assert.deepEqual(
  seq.steps.map((s) => s.kind),
  ["linkedin_visit", "linkedin_like", "linkedin_connect", "email", "linkedin_message", "wait", "linkedin_followup"],
  "visit → like → invite → email (all day 0) → LinkedIn message on accept → follow-up",
);
assert.deepEqual(seq.steps.filter((s) => s.kind === "wait").map((s) => s.waitDays), [2], "only wait: follow-up 2 days after the LinkedIn message");
assert.ok(seq.steps.every((s) => s.kind === "wait" || s.sendVia === "lemlist"), "Lemlist runs every step");
const actions = seq.steps.filter((s) => isActionStep(s.kind));
assert.equal(actions.length, 2);
assert.ok(actions.every((s) => s.status === "pending" && !s.body), "automatic actions carry no copy");
const msgSteps = seq.steps.filter(needsApproval);
assert.deepEqual(msgSteps.map((s) => s.kind), ["linkedin_connect", "email", "linkedin_message", "linkedin_followup"]);
assert.ok(msgSteps.every((s) => s.status === "draft"), "every written line starts as draft — approve first");
const connect = msgSteps[0];
assert.equal(LINKEDIN_CONNECT_NOTE_MAX, 200, "Lemlist invite-note limit");
assert.ok(connect.body.length <= LINKEDIN_CONNECT_NOTE_MAX, "connect note fits Lemlist limit");
const longFirm = buildSequenceForLead({ ...els, firmName: "Peeters & Van den Broeck Registeraccountants en Belastingadviseurs" }, "Floor Hoefkens");
assert.ok(longFirm.steps.find((s) => s.kind === "linkedin_connect").body.length <= LINKEDIN_CONNECT_NOTE_MAX, "long firm names still fit");
assert.ok(/connection request on LinkedIn/.test(emailSteps[0].body), "email mentions the LinkedIn invite");
const dm = msgSteps[2];
assert.ok(/sent you an email/.test(dm.body) && dm.body.includes("?"), "DM references the email and asks one question");
assert.ok(/accept/.test(dm.condition) && /14 days/.test(dm.condition), "DM fires as soon as the invite is accepted");
assert.ok(dm.condition && /accepted/.test(dm.condition), "DM only after the invite is accepted");
assert.ok(msgSteps[3].condition, "follow-up is conditional too");
assert.ok(seq.name.includes("LinkedIn + email"));

// No LinkedIn URL → just the one email
const noLi = buildSequenceForLead({ ...els, linkedInUrl: undefined }, "Floor Hoefkens");
assert.deepEqual(noLi.steps.map((s) => s.kind), ["email"]);
assert.ok(!/connection request/.test(noLi.steps[0].body), "no LinkedIn PS without a LinkedIn URL");
assert.match(noLi.name, /no LinkedIn URL/);

// Lemlist stub: refuses until every written line is approved, returns payload only, never "sent"
const stamp = { id: "seq_t", createdAt: "", updatedAt: "" };
const draftSeq = { ...seq, ...stamp };
assert.equal(buildLemlistPayload(els, draftSeq).ok, false, "unapproved sequence is never pushed");
const approveAll = (q) => ({ ...q, steps: q.steps.map((s) => (needsApproval(s) ? { ...s, status: "approved" } : s)) });
const linkedInOnly = {
  ...draftSeq,
  steps: draftSeq.steps.map((s) => (needsApproval(s) && s.kind !== "email" ? { ...s, status: "approved" } : s)),
};
assert.equal(buildLemlistPayload(els, linkedInOnly).ok, false, "the email must be approved too");
const approvedSeq = approveAll(draftSeq);
const pushed = await pushToLemlist(els, approvedSeq, "", "cmp_test");
assert.equal(pushed.ok, true, "automatic actions don't need approval");
assert.equal(pushed.mode, "stub");
assert.equal(pushed.sent, false);
assert.equal(pushed.payload.campaignId, "cmp_test");
assert.equal(pushed.payload.email, els.email);
assert.deepEqual(pushed.payload.actions, { visitProfile: true, likeLastPost: true });
assert.deepEqual(Object.keys(pushed.payload.variables).sort(), ["connectNote", "emailBody", "emailSubject", "linkedinFollowup", "linkedinMessage"]);
assert.equal(pushed.payload.variables.connectNote, connect.body);
assert.equal(pushed.payload.variables.emailSubject, emailSteps[0].subject);
assert.equal(pushed.payload.variables.linkedinMessage, dm.body);
const likeStep = actions.find((s) => s.kind === "linkedin_like");
const followup = msgSteps[3];
const skipped = {
  ...approvedSeq,
  steps: approvedSeq.steps.map((s) => (s.id === likeStep.id || s.id === followup.id ? { ...s, status: "skipped" } : s)),
};
const withSkip = buildLemlistPayload(els, skipped);
assert.equal(withSkip.ok, true);
assert.equal(withSkip.payload.actions.likeLastPost, false, "skipped like is turned off");
assert.equal(withSkip.payload.variables.linkedinFollowup, "", "skipped step sends empty copy");
assert.deepEqual(withSkip.payload.skippedSteps.sort(), [likeStep.id, followup.id].sort());
assert.equal(buildLemlistPayload({ ...els, email: "" }, approvedSeq).ok, false, "Lemlist needs an email");
assert.equal(resolveLemlistMode("key"), "live_not_wired");
const repliedSeq = { ...approvedSeq, stoppedOnReply: { channel: "linkedin", at: "" } };
assert.equal(buildLemlistPayload(els, repliedSeq).ok, false, "reply stops Lemlist push");
assert.ok(seq.steps.filter(needsApproval).every((s) => s.body && s.body.length > 20), "every written line has copy");
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
assert.ok(/hiring|vacanc|visibility|LinkedIn/i.test(vacBodies), "the email stays on the vacancy story");

const bad = validateSequenceAction({ action: "mark_sent" });
assert.equal(bad.ok, false);
const gen = validateSequenceAction({ action: "generate", leadId: "hs_1" });
assert.equal(gen.ok, true);
const reply = validateSequenceAction({ action: "record_reply", sequenceId: "s1", channel: "linkedin" });
assert.equal(reply.ok, true);
assert.equal(validateSequenceAction({ action: "record_reply", sequenceId: "s1", channel: "sms" }).ok, false);

// Daily 09:00 update (Europe/Amsterdam): window, counts, reply rate
const tue = new Date("2026-11-17T08:00:00Z"); // Tue 09:00 CET
const mon = new Date("2026-11-16T08:00:00Z"); // Mon 09:00 CET
assert.equal(updateWindowStart(tue).toISOString(), "2026-11-16T08:00:00.000Z", "since yesterday 09:00");
assert.equal(updateWindowStart(mon).toISOString(), "2026-11-13T08:00:00.000Z", "Monday covers since Friday");
const at = (iso) => ({ status: "sent", sentAt: iso });
const mk = (id, leadId, steps, extra = {}) => ({ id, leadId, name: id, status: "active", opportunityAngles: [], createdAt: "", updatedAt: "", steps, ...extra });
const duState = {
  leads: [els, joost],
  bookings: [{ id: "b1", leadId: els.id, aeName: "Ludwig", scheduledAt: "", durationMinutes: 30, meetingLink: "", status: "scheduled", createdAt: "2026-11-16T15:00:00Z" }],
  sequences: [
    mk("s1", els.id, [
      { id: "a", kind: "linkedin_connect", label: "", waitDays: 0, ...at("2026-11-16T10:00:00Z") },
      { id: "b", kind: "email", label: "", waitDays: 0, ...at("2026-11-16T10:30:00Z") },
      { id: "c", kind: "linkedin_message", label: "", waitDays: 0, ...at("2026-11-12T10:00:00Z") },
    ], { stoppedOnReply: { channel: "linkedin", at: "2026-11-16T14:00:00Z" } }),
    mk("s2", joost.id, [
      { id: "d", kind: "email", label: "", waitDays: 0, ...at("2026-11-10T10:00:00Z") },
      { id: "e", kind: "linkedin_followup", label: "", waitDays: 0, status: "draft" },
    ]),
    mk("s3", "lead_x", [{ id: "f", kind: "email", label: "", waitDays: 0, status: "draft" }]),
  ],
};
const du = buildDailyUpdate(duState, tue);
assert.deepEqual(du.sent, { invites: 1, emails: 1, linkedinMessages: 0 }, "only sends inside the window count");
assert.equal(du.replies.total, 1);
assert.equal(du.replies.linkedin, 1);
assert.equal(du.replies.leads[0].firm, els.firmName);
assert.deepEqual(du.pilot, { contacted: 2, replied: 1, replyRate: 50 });
assert.equal(du.awaitingApproval, 2, "drafts waiting, replied lead excluded");
assert.equal(du.demosBooked, 1);
assert.ok(du.text.includes("Outreach update — Tue 17 Nov (since yesterday)"));
assert.ok(du.text.includes("Pilot so far: 2 contacted · 1 replied (50%)"));
assert.ok(buildDailyUpdate(duState, mon).text.includes("since Friday"));
assert.equal(buildDailyUpdate({ leads: [], sequences: [], bookings: [] }, tue).pilot.replyRate, 0, "no divide-by-zero");

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
