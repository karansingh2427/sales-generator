"use client";

import { useCallback, useState } from "react";
import type { FeedbackCategory, FeedbackEntry } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Trash2, Ban, CheckCircle2 } from "lucide-react";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "icp", label: "ICP tweak" },
  { value: "company", label: "Company / client" },
  { value: "contact", label: "Contact" },
  { value: "title_preference", label: "Title preference" },
  { value: "messaging_tone", label: "Messaging tone" },
  { value: "disqualifier", label: "Disqualifier" },
  { value: "geo", label: "Geo" },
  { value: "sequence_quality", label: "Sequence quality" },
  { value: "other", label: "Other" },
];

type Props = {
  initialEntries?: FeedbackEntry[];
  onChanged?: () => void;
  onError: (msg: string) => void;
  onStatus: (msg: string) => void;
};

export function FeedbackPanel({
  initialEntries = [],
  onChanged,
  onError,
  onStatus,
}: Props) {
  const [entries, setEntries] = useState<FeedbackEntry[]>(initialEntries);
  const [category, setCategory] = useState<FeedbackCategory>("icp");
  const [text, setText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      onError("Could not load feedback.");
    }
  }, [onError]);

  const visible = showInactive ? entries : entries.filter((e) => e.active);
  const activeCount = entries.filter((e) => e.active).length;

  async function submit() {
    if (!text.trim()) {
      onError("Write the feedback first.");
      return;
    }
    setBusy(true);
    onError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remember",
          category,
          text: text.trim(),
          source: "ui",
          companyName: companyName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Could not save feedback.");
        return;
      }
      setText("");
      setCompanyName("");
      await load();
      onStatus(
        `Remembered feedback (${data.entry?.category}). Next HubSpot pull / sequence draft will apply it.`,
      );
      onChanged?.();
    } catch {
      onError("Feedback save network error.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: active ? "enable" : "disable", id }),
      });
      if (!res.ok) {
        const data = await res.json();
        onError(data.error ?? "Could not update feedback.");
        return;
      }
      await load();
      onStatus(active ? "Feedback re-enabled." : "Feedback disabled for later runs.");
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      if (!res.ok) {
        const data = await res.json();
        onError(data.error ?? "Could not delete feedback.");
        return;
      }
      await load();
      onStatus("Feedback deleted.");
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-teal-800/15 bg-gradient-to-br from-background to-teal-950/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-teal-800" />
          Floor feedback learning
          <Badge variant="secondary" className="ml-1 font-normal">
            {activeCount} active
          </Badge>
        </CardTitle>
        <CardDescription>
          Teach the agent ICP, company skips, tone, titles, geo, sequence quality. Stored in{" "}
          <code className="text-[11px]">.data/feedback.json</code>. Next HubSpot pull / sequence
          draft / lead-run loads active items. Never bypasses approve-before-send.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[160px_1fr]">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => v && setCategory(v as FeedbackCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Company target (optional)</Label>
            <Input
              placeholder="e.g. Peeters Accountants"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Feedback</Label>
          <Textarea
            rows={3}
            placeholder='e.g. "Skip company Acme Legal" · "Prefer Partner titles" · "Never pitch pricing" · "BE ICP: Ops manager for larger cos"'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={busy} onClick={() => void submit()}>
            Remember this feedback
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowInactive((v) => !v)}
          >
            {showInactive ? "Hide disabled" : "Show disabled"}
          </Button>
        </div>

        <ScrollArea className="h-[220px] rounded-md border">
          <div className="space-y-2 p-3">
            {visible.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No learned feedback yet — submit above or say in Cursor: “remember this feedback:
                …”
              </p>
            )}
            {visible.map((e) => (
              <div
                key={e.id}
                className={`rounded-md border p-3 text-sm ${e.active ? "" : "opacity-60"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{e.category}</Badge>
                      <Badge variant="secondary" className="font-normal">
                        {e.source}
                      </Badge>
                      {!e.active && <Badge variant="outline">disabled</Badge>}
                      {e.target?.name && (
                        <span className="text-xs text-muted-foreground">
                          → {e.target.type}: {e.target.name}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground">{e.text}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString()} · {e.instruction.kind}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {e.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        title="Disable"
                        onClick={() => void toggle(e.id, false)}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        title="Re-enable"
                        onClick={() => void toggle(e.id, true)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      title="Delete"
                      onClick={() => void remove(e.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
