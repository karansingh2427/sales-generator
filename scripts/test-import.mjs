/**
 * Behavioral checks for Sales Nav import / BE-NL geo scoring.
 * Run: npm run test:import
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const fixture = fs.readFileSync(
  path.join(root, "tests/fixtures/sales-nav-sample.csv"),
  "utf8",
);

if (!fixture.includes("Janssens") || !fixture.includes("Bakker")) {
  console.error("Fixture missing expected BE/NL firms");
  process.exit(1);
}

const scriptPath = path.join(root, "scripts/_import-test-run.mts");
fs.writeFileSync(
  scriptPath,
  `
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { previewSalesNavCsv, autoMapColumns, findDuplicate } from "../src/lib/sales-nav-import.ts";
import { detectGeoCode, geoScoreBonus, DEFAULT_GEO_FILTER } from "../src/lib/geo.ts";
import type { Lead } from "../src/types/sales.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const csv = fs.readFileSync(path.join(root, "tests/fixtures/sales-nav-sample.csv"), "utf8");

assert.deepEqual(DEFAULT_GEO_FILTER, ["BE", "NL"]);
assert.equal(detectGeoCode("Brussels, Belgium"), "BE");
assert.equal(detectGeoCode("Amsterdam, Netherlands"), "NL");
assert.equal(detectGeoCode("New York, United States"), "OTHER");
assert.ok(geoScoreBonus("BE") > geoScoreBonus("DE"));
assert.ok(geoScoreBonus("NL") > geoScoreBonus("OTHER"));

const headers = ["First Name","Last Name","Title","Company","Email","Person LinkedIn URL","Location"];
const mapping = autoMapColumns(headers);
assert.equal(mapping.firstName, "First Name");
assert.equal(mapping.company, "Company");
assert.equal(mapping.linkedInUrl, "Person LinkedIn URL");

const existing: Lead[] = [{
  id: "lead_dup",
  firmName: "Bakker Legal Group",
  contactName: "Pieter Bakker",
  title: "Head of Marketing",
  email: "p.bakker@bakkerlegal.nl",
  linkedInUrl: "https://www.linkedin.com/in/example-pieter-bakker",
  location: "Amsterdam, NL",
  practiceArea: "Corporate / M&A",
  firmSize: "40",
  icpScore: 90,
  stage: "new",
  source: "demo_sample",
  createdAt: new Date().toISOString(),
}];

const preview = previewSalesNavCsv(csv, existing, { geoFilter: ["BE", "NL"], minScore: 70 });
assert.equal(preview.rows.length, 5);
assert.ok(preview.geoFilter.includes("BE") && preview.geoFilter.includes("NL"));

const be = preview.rows.find(r => r.firmName.includes("Janssens"));
const us = preview.rows.find(r => r.firmName.includes("Doe"));
assert.ok(be, "BE lawyer row present");
assert.ok(us, "US row present");
assert.equal(be!.passesGeoFilter, true);
assert.equal(us!.passesGeoFilter, false);
assert.ok(be!.icpScore > us!.icpScore, "BE lawyer scores higher than US row");

const dupRow = preview.rows.find(r => r.firmName.includes("Bakker"));
assert.ok(dupRow?.isDuplicate, "existing email/LinkedIn marked duplicate");

const dup = findDuplicate({ email: "p.bakker@bakkerlegal.nl", linkedInUrl: "" }, existing);
assert.ok(dup);

console.log("test:import OK — geo defaults, mapping, scoring, dedupe");
`,
);

try {
  execSync(`npx --yes tsx "${scriptPath}"`, { cwd: root, stdio: "inherit" });
} finally {
  try {
    fs.unlinkSync(scriptPath);
  } catch {
    /* ignore */
  }
}
