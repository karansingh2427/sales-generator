"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Cloud, CloudOff } from "lucide-react";

export type HubSpotStatus = {
  mode: "mock" | "live";
  tokenConfigured: boolean;
  lastSyncAt: string | null;
  note: string;
};

type Props = {
  initialStatus: HubSpotStatus;
  onSynced: (added: number, updated: number) => void;
  onError: (msg: string) => void;
  onStatus: (msg: string) => void;
};

export function HubSpotSyncPanel({ initialStatus, onSynced, onError, onStatus }: Props) {
  const [status, setStatus] = useState<HubSpotStatus>(initialStatus);
  const [busy, setBusy] = useState(false);

  async function sync() {
    setBusy(true);
    onError("");
    try {
      const res = await fetch("/api/hubspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "HubSpot sync failed.");
        return;
      }
      const statusRes = await fetch("/api/hubspot");
      setStatus(await statusRes.json());
      const added = data.addedCount ?? 0;
      const updated = data.updatedCount ?? 0;
      onSynced(added, updated);
      const skip = data.skippedStrongPresence ?? 0;
      onStatus(
        `HubSpot ${data.mode} sync: ${added} new, ${updated} updated` +
          (skip ? ` · ${skip} strong-presence flagged/skipped for outreach` : "") +
          (data.errors?.length ? ` · ${data.errors.length} warning(s)` : "") +
          ". Build a sequence from CRM notes next — drafts only.",
      );
    } catch {
      onError("HubSpot sync network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-emerald-700/20 bg-gradient-to-br from-background to-emerald-950/[0.03]">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            {status.mode === "live" ? (
              <Cloud className="h-4 w-4 text-emerald-700" />
            ) : (
              <CloudOff className="h-4 w-4 text-muted-foreground" />
            )}
            HubSpot CRM sync
          </CardTitle>
          <CardDescription>
            Hero path: pull contacts + agent notes (why-good, opener, right contact). Sales Nav CSV
            remains a fallback below.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.mode === "live" ? "default" : "secondary"}>
            {status.mode === "live" ? "Live token" : "Mock mode"}
          </Badge>
          <Button size="sm" disabled={busy} onClick={() => void sync()}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
            {busy ? "Syncing…" : "Sync from HubSpot"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{status.note}</p>
        {status.lastSyncAt && (
          <p className="text-xs">Last sync: {new Date(status.lastSyncAt).toLocaleString()}</p>
        )}
        <p className="text-xs">
          Set <code className="rounded bg-muted px-1">HUBSPOT_ACCESS_TOKEN</code> in{" "}
          <code className="rounded bg-muted px-1">.env.local</code> for live sync. Optional:{" "}
          <code className="rounded bg-muted px-1">HUBSPOT_STAGE_MAP</code>,{" "}
          <code className="rounded bg-muted px-1">HUBSPOT_PROPERTY_MAP</code>.
        </p>
      </CardContent>
    </Card>
  );
}
