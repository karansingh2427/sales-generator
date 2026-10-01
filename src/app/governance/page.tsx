import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const docs = [
  { file: "AGENTS.md", desc: "Agent entry map and pointers" },
  { file: "ARCHITECTURE.md", desc: "Domains × layers summary table" },
  { file: "docs/PRD.md", desc: "Requirements / product scope" },
  { file: "docs/RULES.md", desc: "BDR + AI conduct rules" },
  { file: "docs/TASKS.md", desc: "Operator task catalog" },
  { file: "docs/GOVERNANCE.md", desc: "Security, consent, data handling" },
  { file: "docs/QUALITY_SCORE.md", desc: "Qualitative coverage grades" },
  { file: "tests/evals.json", desc: "Valid / invalid test cases" },
];

export default function GovernancePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI governance</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Same structure as Karandeep&apos;s job-search agent: summary tables, PRD, rules, tasks, and
            eval-style test cases — versioned in this repository.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Repository contracts</CardTitle>
            <CardDescription>Open in GitHub or your editor from the repo root.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {docs.map((d) => (
                <li key={d.file} className="flex justify-between gap-4 border-b border-dashed pb-2 last:border-0">
                  <code className="text-primary">{d.file}</code>
                  <span className="text-muted-foreground text-right">{d.desc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
          Full automation plan for Floor:{" "}
          <Link href="https://cursor.com" className="underline">
            see Project Context → docs/sales-automation-plan.md
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
