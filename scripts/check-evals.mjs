import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..");
const evals = JSON.parse(fs.readFileSync(path.join(root, "tests/evals.json"), "utf8"));

let ok = true;
if (!Array.isArray(evals.valid_cases) || evals.valid_cases.length < 3) {
  console.error("Expected at least 3 valid_cases");
  ok = false;
}
if (!Array.isArray(evals.invalid_cases) || evals.invalid_cases.length < 3) {
  console.error("Expected at least 3 invalid_cases");
  ok = false;
}
for (const c of [...evals.valid_cases, ...evals.invalid_cases]) {
  if (!c.id || !c.scenario || !c.expectations?.length) {
    console.error("Case missing id/scenario/expectations", c);
    ok = false;
  }
}

const rules = fs.readFileSync(path.join(root, "docs/RULES.md"), "utf8");
if (!rules.includes("disqualified")) {
  console.error("RULES.md must mention disqualified leads");
  ok = false;
}
if (!rules.includes("Belgium") && !rules.includes("BE + NL")) {
  console.error("RULES.md must mention Belgium / BE+NL geography");
  ok = false;
}
if (!rules.includes("approve") && !rules.includes("auto-send") && !rules.includes("auto-blast")) {
  console.error("RULES.md must mention human approve / no auto-send");
  ok = false;
}
if (!rules.includes("HubSpot")) {
  console.error("RULES.md must mention HubSpot");
  ok = false;
}

const ids = [...evals.valid_cases, ...evals.invalid_cases].map((c) => c.id);
for (const required of ["V-04", "V-05", "V-07", "V-08", "I-05", "I-06", "I-07", "I-08"]) {
  if (!ids.includes(required)) {
    console.error(`Missing eval case ${required}`);
    ok = false;
  }
}

if (ok) {
  console.log(`Eval structure OK: ${evals.valid_cases.length} valid, ${evals.invalid_cases.length} invalid`);
  process.exit(0);
}
process.exit(1);
