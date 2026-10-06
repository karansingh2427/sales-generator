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
import { buildSequenceForLead, validateSequenceAction } from "../src/lib/sequence-engine.ts";
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
assert.ok(seq.steps.length >= 4);
assert.ok(seq.steps.some((s) => s.kind === "linkedin_connect"));
assert.ok(seq.steps.some((s) => s.kind === "wait"));
assert.ok(seq.steps.some((s) => s.kind === "email"));
assert.ok(seq.steps.every((s) => s.kind === "wait" || (s.body && s.body.length > 20)));
assert.ok(seq.opportunityAngles.length > 0);
assert.ok(
  seq.steps.some((s) => s.body && /AE|calendar link/i.test(s.body)),
  "sequence CTA mentions AE calendar link",
);

const bad = validateSequenceAction({ action: "mark_sent" });
assert.equal(bad.ok, false);
const gen = validateSequenceAction({ action: "generate", leadId: "hs_1" });
assert.equal(gen.ok, true);

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
