"use client";

import { useCallback, useMemo, useState } from "react";
import type { DemoBooking, FeedbackEntry, Lead, OutreachDraft, OutreachSequence } from "@/types/sales";
import { PRACTICE_AREAS, WILLOW_PITCH, ICP_GEOGRAPHY } from "@/lib/willow-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, PhoneOff, CalendarPlus, Mail, ListOrdered, GraduationCap } from "lucide-react";
import { SalesNavImportPanel } from "@/components/sales-nav-import-panel";
import { HubSpotSyncPanel, type HubSpotStatus } from "@/components/hubspot-sync-panel";
import { SequenceBuilderPanel } from "@/components/sequence-builder-panel";
import { FeedbackPanel } from "@/components/feedback-panel";
import type { FeedbackCategory } from "@/types/sales";

const STAGE_LABEL: Record<Lead["stage"], string> = {
  new: "New",
  qualified: "Qualified",
  outreach_drafted: "Draft ready",
  contacted: "Contacted",
  replied: "Replied",
  demo_booked: "Demo booked",
  demo_completed: "Demo completed",
  demo_rescheduled: "Demo rescheduled",
  demo_cancelled: "Demo cancelled",
  disqualified: "Disqualified",
};

function stageVariant(stage: Lead["stage"]) {
  if (stage === "demo_booked" || stage === "demo_completed") return "default" as const;
  if (stage === "disqualified" || stage === "demo_cancelled") return "outline" as const;
  if (stage === "replied" || stage === "demo_rescheduled") return "secondary" as const;
  return "outline" as const;
}

type AeRosterEntry = { name: string; calendarUrl: string };

type WorkbenchProps = {
  initialLeads: Lead[];
  initialOutreach: OutreachDraft[];
  initialBookings: DemoBooking[];
  initialSequences: OutreachSequence[];
  initialFeedback?: FeedbackEntry[];
  hubspotStatus: HubSpotStatus;
  aes: string[];
  aeRoster?: AeRosterEntry[];
};

export function LeadsWorkbench({
  initialLeads,
  initialOutreach,
  initialBookings,
  initialSequences,
  initialFeedback = [],
  hubspotStatus,
  aes,
  aeRoster = [],
}: WorkbenchProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [outreach, setOutreach] = useState<OutreachDraft[]>(initialOutreach);
  const [bookings, setBookings] = useState<DemoBooking[]>(initialBookings);
  const [sequences, setSequences] = useState<OutreachSequence[]>(initialSequences);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [practiceFilter, setPracticeFilter] = useState<string>("any");
  const [genCount, setGenCount] = useState(3);
  const [bookingForm, setBookingForm] = useState({
    aeName: "",
    scheduledAt: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sequenceFocusLeadId, setSequenceFocusLeadId] = useState<string | null>(null);
  const [tab, setTab] = useState("leads");
  const [teachLead, setTeachLead] = useState<Lead | null>(null);
  const [teachText, setTeachText] = useState("");
  const [teachCategory, setTeachCategory] = useState<FeedbackCategory>("company");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, o, b, s] = await Promise.all([
        fetch("/api/leads").then((r) => r.json()),
        fetch("/api/outreach").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/sequences").then((r) => r.json()),
      ]);
      setLeads(l.leads ?? []);
      setOutreach(o.outreach ?? []);
      setBookings(b.bookings ?? []);
      setSequences(s.sequences ?? []);
    } catch {
      setError("Could not load workspace. Retry in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = useMemo(() => {
    const active = leads.filter((l) => l.stage !== "disqualified" && l.stage !== "demo_cancelled");
    return {
      total: active.length,
      demos: leads.filter(
        (l) =>
          l.stage === "demo_booked" ||
          l.stage === "demo_completed" ||
          l.stage === "demo_rescheduled",
      ).length,
      drafts: outreach.length,
      coldCallsAvoided: active.filter((l) => l.stage !== "new").length,
    };
  }, [leads, outreach]);

  async function generateDemoLeads() {
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate",
        count: genCount,
        practiceArea: practiceFilter,
        minScore: 78,
      }),
    });
    if (!res.ok) {
      setError("Demo sample generation failed.");
      return;
    }
    const data = await res.json();
    await refresh();
    setStatus(
      `Added ${data.added?.length ?? 0} Demo / sample leads (NL/BE-biased). Use Sales Nav CSV for live prospects.`,
    );
  }

  async function draftForLead(lead: Lead, channel: "email" | "linkedin_dm") {
    setError(null);
    setStatus(null);
    const res = await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, channel }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Outreach failed.");
      return;
    }
    setDraft(data.draft);
    setSelected(lead);
    setStatus(`Drafted ${channel === "email" ? "email" : "LinkedIn DM"} for ${lead.firmName}.`);
    await refresh();
  }

  async function markContacted(lead: Lead) {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_stage", leadId: lead.id, stage: "contacted" }),
    });
    await refresh();
  }

  async function setPostDemoStage(
    lead: Lead,
    stage: "demo_completed" | "demo_rescheduled" | "demo_cancelled",
  ) {
    setError(null);
    const res = await fetch("/api/hubspot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "push_stage", leadId: lead.id, stage }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Stage update failed.");
      return;
    }
    setStatus(
      `Post-demo stage → ${STAGE_LABEL[stage]} (HubSpot writeback English-only).`,
    );
    await refresh();
  }

  async function submitBooking() {
    if (!selected) return;
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: selected.id,
        aeName: bookingForm.aeName,
        scheduledAt: new Date(bookingForm.scheduledAt).toISOString(),
        durationMinutes: 30,
        notes: bookingForm.notes,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Booking failed.");
      return;
    }
    setBookOpen(false);
    setDraft(null);
    await refresh();
  }

  function openBook(lead: Lead) {
    setSelected(lead);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setBookingForm({
      aeName: aes[0] ?? "Sarah Chen",
      scheduledAt: tomorrow.toISOString().slice(0, 16),
      notes: "",
    });
    setBookOpen(true);
  }

  function openTeach(lead: Lead) {
    setTeachLead(lead);
    setTeachCategory("company");
    setTeachText(`Skip company ${lead.firmName}`);
  }

  async function submitTeach() {
    if (!teachLead || !teachText.trim()) return;
    setError(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "remember",
        category: teachCategory,
        text: teachText.trim(),
        source: "teach_lead",
        target: {
          type: "company",
          name: teachLead.firmName,
          leadId: teachLead.id,
          hubspotCompanyId: teachLead.hubspotCompanyId,
        },
        companyName: teachLead.firmName,
        leadId: teachLead.id,
        leadName: teachLead.firmName,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save teach-agent feedback.");
      return;
    }
    setTeachLead(null);
    setTeachText("");
    setStatus(
      `Taught agent about ${teachLead.firmName}. Next HubSpot pull / sequence run will apply it.`,
    );
  }

  if (loading && leads.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading pipeline…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active leads</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outreach drafts</CardDescription>
            <CardTitle className="text-2xl">{stats.drafts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Demos booked</CardDescription>
            <CardTitle className="text-2xl">{stats.demos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Touched without cold call</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {stats.coldCallsAvoided}
              <PhoneOff className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">{WILLOW_PITCH.headline}</CardTitle>
          <CardDescription>
            {WILLOW_PITCH.valueProps.join(" · ")}
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {status && !error && (
        <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
          {status}
        </p>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="bookings">Demo calendar</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <HubSpotSyncPanel
            initialStatus={hubspotStatus}
            onSynced={() => {
              void refresh();
            }}
            onError={(msg) => setError(msg || null)}
            onStatus={(msg) => {
              setError(null);
              setStatus(msg);
            }}
          />

          <SalesNavImportPanel
            onImported={(n) => {
              void refresh().then(() => {
                if (n === 0) setStatus("No new leads added (all duplicates or empty selection).");
              });
            }}
            onError={(msg) => setError(msg || null)}
            onStatus={(msg) => {
              setError(null);
              setStatus(msg);
            }}
          />

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-4">
              <div>
                <CardTitle>Expertise B2B pipeline</CardTitle>
                <CardDescription>
                  Hero: HubSpot sync (agent notes). Fallback: Sales Nav CSV. Geo default{" "}
                  {ICP_GEOGRAPHY.defaultFilterLabel}. Demo samples are labeled fallback only.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-3">
                <div className="w-full text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Demo / sample data
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Practice</Label>
                  <Select
                    value={practiceFilter}
                    onValueChange={(v) => v && setPracticeFilter(v)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any practice</SelectItem>
                      {PRACTICE_AREAS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    className="w-20"
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                  />
                </div>
                <Button variant="secondary" onClick={() => void generateDemoLeads()}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Add demo samples
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Firm</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Practice</TableHead>
                      <TableHead>ICP</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="font-medium">{lead.firmName}</div>
                          <div className="text-xs text-muted-foreground">{lead.location}</div>
                        </TableCell>
                        <TableCell>
                          <div>{lead.contactName}</div>
                          <div className="text-xs text-muted-foreground">{lead.title}</div>
                        </TableCell>
                        <TableCell>{lead.practiceArea}</TableCell>
                        <TableCell>
                          <Badge variant={lead.icpScore >= 85 ? "default" : "secondary"}>
                            {lead.icpScore}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {lead.source === "hubspot"
                              ? "HubSpot"
                              : lead.source === "sales_nav_csv"
                                ? "Sales Nav"
                                : lead.source === "demo_sample" || lead.source === "mock_apollo"
                                  ? "Demo"
                                  : lead.source}
                          </Badge>
                          {lead.socialPresence && lead.socialPresence !== "unknown" && (
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              Social: {lead.socialPresence}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stageVariant(lead.stage)}>{STAGE_LABEL[lead.stage]}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={lead.stage === "disqualified"}
                            title="Build LinkedIn + email sequence"
                            onClick={() => {
                              setSequenceFocusLeadId(lead.id);
                              setTab("sequences");
                            }}
                          >
                            <ListOrdered className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={lead.stage === "disqualified"}
                            onClick={() => void draftForLead(lead, "email")}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={lead.stage === "disqualified"}
                            onClick={() => void draftForLead(lead, "linkedin_dm")}
                          >
                            InMail
                          </Button>
                          <Button
                            size="sm"
                            disabled={
                              lead.stage === "disqualified" ||
                              lead.stage === "demo_booked" ||
                              lead.stage === "demo_completed" ||
                              lead.stage === "demo_cancelled"
                            }
                            onClick={() => openBook(lead)}
                            title="Book on AE calendar link"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openTeach(lead)}
                            title="Teach agent about this lead"
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-4">
          <SequenceBuilderPanel
            leads={leads}
            initialSequences={sequences}
            focusLeadId={sequenceFocusLeadId}
            onChanged={() => void refresh()}
            onError={(msg) => setError(msg || null)}
            onStatus={(msg) => {
              setError(null);
              setStatus(msg);
            }}
          />
        </TabsContent>

        <TabsContent value="outreach">
          <Card>
            <CardHeader>
              <CardTitle>AI-assisted drafts</CardTitle>
              <CardDescription>
                Single-touch drafts and sequence step mirrors. Prefer the Sequences tab for
                multi-channel playbooks. Nothing auto-sends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {outreach.length === 0 && (
                <p className="text-sm text-muted-foreground">No drafts yet — generate from the Leads tab.</p>
              )}
              {outreach.map((o) => {
                const lead = leads.find((l) => l.id === o.leadId);
                return (
                  <div key={o.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{lead?.firmName ?? o.leadId}</div>
                      <Badge variant="outline">{o.channel}</Badge>
                    </div>
                    {o.subject && <p className="text-sm font-medium">Subject: {o.subject}</p>}
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">{o.body}</pre>
                    <p className="text-xs text-primary/80">Why: {o.rationale}</p>
                    {lead && lead.stage === "outreach_drafted" && (
                      <Button size="sm" onClick={() => void markContacted(lead)}>
                        Mark sent (skip cold call)
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <FeedbackPanel
            initialEntries={initialFeedback}
            onError={(msg) => setError(msg || null)}
            onStatus={(msg) => {
              setError(null);
              setStatus(msg);
            }}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>AE handoff</CardTitle>
              <CardDescription>
                Book 30-minute Willow demos on each AE’s calendar link (same pattern Floor uses after
                cold calls — not a shared Calendly). After Demo Booked → Completed | Rescheduled |
                Cancelled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No demos scheduled yet.</p>
              )}
              {bookings.map((b) => {
                const lead = leads.find((l) => l.id === b.leadId);
                return (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{lead?.firmName}</p>
                      <p className="text-sm text-muted-foreground">
                        AE: {b.aeName} · {new Date(b.scheduledAt).toLocaleString()}
                        {lead ? ` · ${STAGE_LABEL[lead.stage]}` : ""}
                      </p>
                      {lead?.stage === "demo_booked" && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void setPostDemoStage(lead, "demo_completed")}
                          >
                            Demo completed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void setPostDemoStage(lead, "demo_rescheduled")}
                          >
                            Rescheduled
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void setPostDemoStage(lead, "demo_cancelled")}
                          >
                            Cancelled
                          </Button>
                        </div>
                      )}
                    </div>
                    <a
                      href={b.meetingLink}
                      className="text-sm text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      AE calendar link
                    </a>
                  </div>
                );
              })}
              {aeRoster.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Roster calendar URLs (placeholders until Floor pastes real AE links):{" "}
                  {aeRoster.map((a) => a.name).join(", ")}.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!draft && !bookOpen}
        onOpenChange={(open) => {
          if (!open) setDraft(null);
        }}
      >
        <DialogContent className="max-w-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review outreach</DialogTitle>
            <DialogDescription>Edit before sending from LinkedIn or email client.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              {draft.subject && (
                <div>
                  <Label>Subject</Label>
                  <Input readOnly value={draft.subject} />
                </div>
              )}
              <div>
                <Label>Body</Label>
                <Textarea rows={10} readOnly value={draft.body} />
              </div>
              <p className="text-xs text-muted-foreground">{draft.rationale}</p>
            </div>
          )}
          <DialogFooter>
            {selected && (
              <>
                <Button variant="outline" onClick={() => void markContacted(selected)}>
                  Mark sent
                </Button>
                <Button onClick={() => openBook(selected)}>Book demo for AE</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!teachLead}
        onOpenChange={(open) => {
          if (!open) setTeachLead(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Teach the agent</DialogTitle>
            <DialogDescription>
              {teachLead?.firmName} — saved feedback applies on the next HubSpot pull / sequence
              draft. Does not auto-send.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category</Label>
              <Select
                value={teachCategory}
                onValueChange={(v) => v && setTeachCategory(v as FeedbackCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company / skip</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="messaging_tone">Messaging tone</SelectItem>
                  <SelectItem value="disqualifier">Disqualifier</SelectItem>
                  <SelectItem value="icp">ICP</SelectItem>
                  <SelectItem value="sequence_quality">Sequence quality</SelectItem>
                  <SelectItem value="title_preference">Title preference</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What should the agent remember?</Label>
              <Textarea
                rows={4}
                value={teachText}
                onChange={(e) => setTeachText(e.target.value)}
                placeholder={`Skip company ${teachLead?.firmName ?? ""} / Prefer Partner titles / Never pitch pricing…`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeachLead(null)}>
              Cancel
            </Button>
            <Button onClick={() => void submitTeach()}>Remember feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bookOpen}
        onOpenChange={(open) => {
          setBookOpen(!!open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Willow demo</DialogTitle>
            <DialogDescription>
              {selected?.firmName} — uses the selected AE’s calendar link (manual AE link pattern,
              not a shared Calendly).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Account executive</Label>
              <Select
                value={bookingForm.aeName}
                onValueChange={(v) => v && setBookingForm((f) => ({ ...f, aeName: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AE" />
                </SelectTrigger>
                <SelectContent>
                  {aes.map((ae) => (
                    <SelectItem key={ae} value={ae}>
                      {ae}
                      {aeRoster.find((r) => r.name === ae)
                        ? " · personal calendar link"
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date & time</Label>
              <Input
                type="datetime-local"
                value={bookingForm.scheduledAt}
                onChange={(e) => setBookingForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <div>
              <Label>Notes for AE</Label>
              <Textarea
                value={bookingForm.notes}
                onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Practice area, LinkedIn activity, objections…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => void submitBooking()}>Confirm booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
