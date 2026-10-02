"use client";

import { useMemo, useState } from "react";
import type { Lead, OutreachSequence, SequenceStep } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ListOrdered, Send, SkipForward } from "lucide-react";

type Props = {
  leads: Lead[];
  initialSequences: OutreachSequence[];
  onChanged: () => void;
  onError: (msg: string) => void;
  onStatus: (msg: string) => void;
  focusLeadId?: string | null;
};

function stepBadge(status: SequenceStep["status"]) {
  if (status === "sent") return "default" as const;
  if (status === "approved") return "secondary" as const;
  if (status === "skipped") return "outline" as const;
  return "outline" as const;
}

function editsFromSequence(seq: OutreachSequence): Record<string, { subject?: string; body?: string }> {
  const map: Record<string, { subject?: string; body?: string }> = {};
  for (const st of seq.steps) {
    map[st.id] = { subject: st.subject, body: st.body };
  }
  return map;
}

export function SequenceBuilderPanel({
  leads,
  initialSequences,
  onChanged,
  onError,
  onStatus,
  focusLeadId,
}: Props) {
  const [sequences, setSequences] = useState<OutreachSequence[]>(initialSequences);
  const [pickedLeadId, setPickedLeadId] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(initialSequences[0]?.id ?? null);
  const [edits, setEdits] = useState<Record<string, { subject?: string; body?: string }>>(() => {
    const first = initialSequences[0];
    return first ? editsFromSequence(first) : {};
  });
  const [busy, setBusy] = useState(false);

  const leadId = focusLeadId || pickedLeadId;

  const eligible = useMemo(
    () => leads.filter((l) => l.stage !== "disqualified"),
    [leads],
  );

  const active = sequences.find((s) => s.id === activeId) ?? sequences[0] ?? null;

  async function generate() {
    if (!leadId) {
      onError("Pick a lead before generating a sequence.");
      return;
    }
    setBusy(true);
    onError("");
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Sequence generate failed.");
        return;
      }
      const seq = data.sequence as OutreachSequence;
      setSequences((prev) => {
        const others = prev.filter((s) => s.id !== seq.id);
        return [seq, ...others];
      });
      setActiveId(seq.id);
      setEdits((prev) => ({ ...prev, ...editsFromSequence(seq) }));
      onChanged();
      onStatus(
        data.mode === "existing"
          ? `Opened existing sequence for ${leads.find((l) => l.id === leadId)?.firmName}.`
          : `Draft sequence ready — LinkedIn → wait → follow-up → email. Approve each step before mark sent.`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function act(
    action: "update_step" | "approve_step" | "mark_sent" | "skip_step",
    step: SequenceStep,
  ) {
    if (!active) return;
    setBusy(true);
    onError("");
    try {
      const edit = edits[step.id] ?? {};
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          sequenceId: active.id,
          stepId: step.id,
          subject: edit.subject,
          body: edit.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Sequence step action failed.");
        return;
      }
      const seq = data.sequence as OutreachSequence;
      setSequences((prev) => prev.map((s) => (s.id === seq.id ? seq : s)));
      setEdits((prev) => ({ ...prev, ...editsFromSequence(seq) }));
      onChanged();
      if (action === "approve_step") onStatus(`Approved: ${step.label}. Send outside the app, then Mark sent.`);
      if (action === "mark_sent") onStatus(`Marked sent: ${step.label}.`);
      if (action === "skip_step") onStatus(`Skipped: ${step.label}.`);
      if (action === "update_step") onStatus(`Saved draft edits for ${step.label}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListOrdered className="h-4 w-4" />
            Multi-channel sequence drafts
          </CardTitle>
          <CardDescription>
            LinkedIn connect/message → wait a few days → LinkedIn follow-up → email. Uses CRM
            opener/why-good and opportunity angles. <strong>No auto-send</strong> — draft → approve
            → mark sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1 space-y-1">
            <Label className="text-xs">Lead</Label>
            <Select value={leadId || undefined} onValueChange={(v) => v && setPickedLeadId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead" />
              </SelectTrigger>
              <SelectContent>
                {eligible.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.firmName} · {l.contactName}
                    {l.source === "hubspot" ? " (HubSpot)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={busy || !leadId} onClick={() => void generate()}>
            Generate sequence
          </Button>
        </CardContent>
      </Card>

      {sequences.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {sequences.map((s) => {
            const lead = leads.find((l) => l.id === s.leadId);
            return (
              <Button
                key={s.id}
                size="sm"
                variant={active?.id === s.id ? "default" : "outline"}
                onClick={() => {
                  setActiveId(s.id);
                  setEdits((prev) => ({ ...prev, ...editsFromSequence(s) }));
                }}
              >
                {lead?.firmName ?? s.leadId}
              </Button>
            );
          })}
        </div>
      )}

      {!active && (
        <p className="text-sm text-muted-foreground">
          No sequences yet. Sync HubSpot (or pick a lead) and generate a draft playbook.
        </p>
      )}

      {active && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{active.name}</CardTitle>
              <Badge variant="outline">{active.status}</Badge>
            </div>
            <CardDescription>
              Angles: {active.opportunityAngles.join(", ") || "—"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {active.steps.map((step, i) => (
              <div key={step.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-sm">
                    {i + 1}. {step.label}
                    {step.channel ? ` · ${step.channel}` : ""}
                  </div>
                  <Badge variant={stepBadge(step.status)}>{step.status}</Badge>
                </div>
                {step.kind === "wait" ? (
                  <p className="text-sm text-muted-foreground">{step.rationale}</p>
                ) : (
                  <>
                    {step.kind === "email" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Subject</Label>
                        <Input
                          value={edits[step.id]?.subject ?? step.subject ?? ""}
                          disabled={step.status === "sent" || step.status === "skipped"}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [step.id]: { ...prev[step.id], subject: e.target.value },
                            }))
                          }
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Draft body</Label>
                      <Textarea
                        rows={6}
                        value={edits[step.id]?.body ?? step.body ?? ""}
                        disabled={step.status === "sent" || step.status === "skipped"}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [step.id]: { ...prev[step.id], body: e.target.value },
                          }))
                        }
                      />
                    </div>
                    {step.rationale && (
                      <p className="text-xs text-primary/80">Why: {step.rationale}</p>
                    )}
                  </>
                )}
                <div className="flex flex-wrap gap-2">
                  {step.kind !== "wait" && step.status !== "sent" && step.status !== "skipped" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void act("update_step", step)}
                      >
                        Save edits
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy || step.status === "approved"}
                        onClick={() => void act("approve_step", step)}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        disabled={busy || step.status !== "approved"}
                        onClick={() => void act("mark_sent", step)}
                      >
                        <Send className="mr-1 h-3.5 w-3.5" />
                        Mark sent
                      </Button>
                    </>
                  )}
                  {step.kind === "wait" && step.status !== "sent" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void act("mark_sent", step)}
                    >
                      Mark wait done
                    </Button>
                  )}
                  {step.status !== "sent" && step.status !== "skipped" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void act("skip_step", step)}
                    >
                      <SkipForward className="mr-1 h-3.5 w-3.5" />
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
