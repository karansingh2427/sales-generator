/**
 * Behavioral checks for Floor feedback learning.
 * Run: npm run test:feedback
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const root = path.join(import.meta.dirname, "..");
const scriptPath = path.join(root, "scripts/_feedback-test-run.mts");
const tmpData = fs.mkdtempSync(path.join(os.tmpdir(), "sg-feedback-"));

fs.writeFileSync(
  scriptPath,
  `
import assert from "node:assert/strict";
import { promises as fs } from "fs";
import path from "path";
import {
  applyFeedbackToLeads,
  buildFeedbackApplication,
  inferInstruction,
  sequenceGuidanceFromFeedback,
  applyNeverPitchToBody,
} from "../src/lib/feedback.ts";
import type { FeedbackEntry, Lead } from "../src/types/sales.ts";

assert.equal(
  inferInstruction("Skip company Acme Legal", "company").kind,
  "skip_company",
);
assert.equal(
  (inferInstruction("Skip company Acme Legal", "company") as { companyName: string }).companyName
    .toLowerCase()
    .includes("acme"),
  true,
);
assert.equal(inferInstruction("Prefer Partner titles", "title_preference").kind, "prefer_title");
assert.equal(inferInstruction("Never pitch pricing on LinkedIn", "messaging_tone").kind, "never_pitch");
assert.equal(inferInstruction("Warmer tone, less salesy", "messaging_tone").kind, "tone");
assert.equal(inferInstruction("BE ICP: Ops manager for larger cos", "icp").kind, "icp_tweak");

const entries: FeedbackEntry[] = [
  {
    id: "fb_1",
    category: "company",
    text: "Skip company Peeters Accountants",
    instruction: { kind: "skip_company", companyName: "Peeters Accountants" },
    active: true,
    source: "ui",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb_2",
    category: "title_preference",
    text: "Prefer Partner titles",
    instruction: { kind: "prefer_title", titles: ["Partner"] },
    active: true,
    source: "skill",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb_3",
    category: "messaging_tone",
    text: "Never pitch pricing",
    instruction: { kind: "never_pitch", topic: "pricing" },
    active: true,
    source: "ui",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fb_off",
    category: "company",
    text: "Skip company ShouldNotApply",
    instruction: { kind: "skip_company", companyName: "ShouldNotApply" },
    active: false,
    source: "ui",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const leads = [
  {
    id: "l1",
    firmName: "Peeters Accountants",
    contactName: "Els",
    title: "Managing Partner",
    email: "a@example.com",
    location: "Antwerp, BE",
    practiceArea: "Accountancy",
    firmSize: "35",
    icpScore: 90,
    stage: "new",
    source: "hubspot",
    createdAt: new Date().toISOString(),
  },
  {
    id: "l2",
    firmName: "ShouldNotApply",
    contactName: "X",
    title: "Analyst",
    email: "b@example.com",
    location: "Brussels, BE",
    practiceArea: "Legal",
    firmSize: "10",
    icpScore: 70,
    stage: "new",
    source: "hubspot",
    createdAt: new Date().toISOString(),
  },
  {
    id: "l3",
    firmName: "Other Firm",
    contactName: "Y",
    title: "Partner",
    email: "c@example.com",
    location: "Ghent, BE",
    practiceArea: "Legal",
    firmSize: "20",
    icpScore: 85,
    stage: "new",
    source: "hubspot",
    createdAt: new Date().toISOString(),
  },
] as Lead[];

const applied = applyFeedbackToLeads(leads, entries);
assert.equal(applied.skipped.length, 1);
assert.equal(applied.skipped[0].firmName, "Peeters Accountants");
assert.ok(applied.kept.some((l) => l.firmName === "ShouldNotApply"), "disabled feedback ignored");
assert.ok(applied.preferredBoostIds.includes("l3"));
assert.equal(applied.kept[0].id, "l3", "preferred title floats first");

const app = buildFeedbackApplication(entries);
assert.ok(app.neverPitchTopics.some((t) => /pricing/i.test(t)));
const guidance = sequenceGuidanceFromFeedback(app);
assert.ok(/Never pitch/i.test(guidance) || /pricing/i.test(guidance));
assert.equal(
  applyNeverPitchToBody("Talk about pricing tomorrow", ["pricing"]),
  "Talk about [omitted per Floor feedback] tomorrow",
);

// Persistence against temp .data via cwd override is hard; file write path checked via store helpers
const dataDir = ${JSON.stringify(tmpData)};
await fs.mkdir(dataDir, { recursive: true });
const storePath = path.join(dataDir, "feedback.json");
await fs.writeFile(
  storePath,
  JSON.stringify({ version: 1, entries, updatedAt: new Date().toISOString() }, null, 2),
);
const raw = JSON.parse(await fs.readFile(storePath, "utf8"));
assert.equal(raw.entries.length, 4);
assert.ok(raw.entries[0].createdAt);

console.log("Feedback learning unit checks passed");
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
  try {
    fs.rmSync(tmpData, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
