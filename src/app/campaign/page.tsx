import { AppShell } from "@/components/app-shell";
import { CampaignStudio } from "@/components/campaign/campaign-studio";
import { readState } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CampaignPage({ searchParams }: PageProps<"/campaign">) {
  const { lead } = await searchParams;
  const state = await readState();
  return (
    <AppShell>
      <CampaignStudio
        initialLeads={state.leads}
        initialSequences={state.sequences ?? []}
        bdrName={state.bdrName}
        initialLeadId={typeof lead === "string" ? lead : null}
      />
    </AppShell>
  );
}
