import { AppShell } from "@/components/app-shell";
import { LeadsWorkbench } from "@/components/leads-workbench";
import type { HubSpotStatus } from "@/components/hubspot-sync-panel";
import { readState } from "@/lib/db";
import { defaultHubSpotConfig } from "@/lib/hubspot-config";
import { DEFAULT_AES } from "@/lib/willow-context";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const state = await readState();
  const tokenSet = Boolean(process.env.HUBSPOT_ACCESS_TOKEN?.trim());
  const cfg = state.hubspot ?? defaultHubSpotConfig();
  const hubspotStatus: HubSpotStatus = {
    mode: tokenSet ? "live" : "mock",
    tokenConfigured: tokenSet,
    lastSyncAt: cfg.lastSyncAt ?? null,
    note: tokenSet
      ? "HUBSPOT_ACCESS_TOKEN set — sync will call HubSpot CRM API."
      : "No HUBSPOT_ACCESS_TOKEN — sync uses mock CRM notes (why/opener/contact).",
  };

  return (
    <AppShell>
      <LeadsWorkbench
        initialLeads={state.leads}
        initialOutreach={state.outreach}
        initialBookings={state.bookings}
        initialSequences={state.sequences ?? []}
        hubspotStatus={hubspotStatus}
        aes={[...DEFAULT_AES]}
      />
    </AppShell>
  );
}
