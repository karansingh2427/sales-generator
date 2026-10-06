/**
 * Behavioral checks for Sales Nav import / NL-first geo scoring.
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
  console.error("Fixture missing expected NL/BE firms");
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
import { detectGeoCode, geoScoreBonus, DEFAULT_GEO_FILTER, PRIMARY_GEO } from "../src/lib/geo.ts";
import type { Lead } from "../src/types/sales.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const csv = fs.readFileSync(path.join(root, "tests/fixtures/sales-nav-sample.csv"), "utf8");

assert.deepEqual(DEFAULT_GEO_FILTER, ["NL", "BE"]);
assert.equal(PRIMARY_GEO, "NL");
assert.equal(detectGeoCode("Brussels, Belgium"), "BE");
assert.equal(detectGeoCode("Amsterdam, Netherlands"), "NL");
assert.equal(detectGeoCode("New York, United States"), "OTHER");
assert.equal(detectGeoCode("Berlin, Germany"), "OTHER");
assert.ok(geoScoreBonus("NL") > geoScoreBonus("BE"));
assert.ok(geoScoreBonus("BE") > geoScoreBonus("OTHER"));
assert.equal(geoScoreBonus("OTHER"), 0);

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

const preview = previewSalesNavCsv(csv, existing, { geoFilter: ["NL", "BE"], minScore: 70 });
assert.equal(preview.rows.length, 5);
assert.ok(preview.geoFilter.includes("BE"));
assert.ok(preview.geoFilter.includes("NL"));

const be = preview.rows.find(r => r.firmName.includes("Janssens"));
const nl = preview.rows.find(r => r.firmName.includes("Bakker"));
const us = preview.rows.find(r => r.firmName.includes("Doe"));
assert.ok(be, "BE lawyer row present");
assert.ok(nl, "NL lawyer row present");
assert.ok(us, "US row present");
assert.equal(be!.passesGeoFilter, true, "BE included in default NL+BE filter");
assert.equal(nl!.passesGeoFilter, true);
assert.equal(us!.passesGeoFilter, false);
assert.ok(nl!.icpScore > us!.icpScore, "NL lawyer scores higher than US row");
assert.ok(nl!.icpScore >= be!.icpScore, "NL scores at least as high as BE for comparable rows");

const previewBeOnly = previewSalesNavCsv(csv, existing, { geoFilter: ["BE"], minScore: 70 });
const nlBeOnly = previewBeOnly.rows.find(r => r.firmName.includes("Bakker"));
assert.equal(nlBeOnly!.passesGeoFilter, false, "NL filtered when BE-only override");

const dupRow = preview.rows.find(r => r.firmName.includes("Bakker"));
assert.ok(dupRow?.isDuplicate, "existing email/LinkedIn marked duplicate");

const dup = findDuplicate({ email: "p.bakker@bakkerlegal.nl", linkedInUrl: "" }, existing);
assert.ok(dup);

console.log("test:import OK — NL-first geo defaults, mapping, scoring, dedupe");
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
