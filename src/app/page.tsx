import { AppShell } from "@/components/app-shell";
import { LeadsWorkbench } from "@/components/leads-workbench";
import { readState } from "@/lib/db";
import { DEFAULT_AES } from "@/lib/willow-context";

export default async function HomePage() {
  const state = await readState();
  return (
    <AppShell>
      <LeadsWorkbench
        initialLeads={state.leads}
        initialOutreach={state.outreach}
        initialBookings={state.bookings}
        aes={[...DEFAULT_AES]}
      />
    </AppShell>
  );
}
