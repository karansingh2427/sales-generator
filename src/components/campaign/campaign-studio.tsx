"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Lead, OutreachSequence, SequenceStep } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildStoryArc } from "@/lib/story-arc";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarCheck,
  CheckCheck,
  CircleCheck,
  CircleDashed,
  Inbox,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { FieldLabel, initials, LinkedInIcon, Panel, PanelHeader } from "@/components/campaign/campaign-ui";
import { MessageTimeline, type StepAction } from "@/components/campaign/message-timeline";

type Props = {
  initialLeads: Lead[];
  initialSequences: OutreachSequence[];
  bdrName: string;
  initialLeadId: string | null;
};

type CampaignState = "not_built" | "draft" | "partly" | "approved" | "replied";

const STATE_LABEL: Record<CampaignState, { label: string; dot: string }> = {
  not_built: { label: "Not built", dot: "bg-slate-300" },
  draft: { label: "Needs review", dot: "bg-amber-400" },
  partly: { label: "In review", dot: "bg-amber-400" },
  approved: { label: "Approved", dot: "bg-emerald-500" },
  replied: { label: "Replied", dot: "bg-sky-500" },
};

const VERTICAL_LABEL: Record<string, string> = {
  legal: "Legal",
  accountancy: "Accountancy",
  it: "IT",
  hr_recruitment: "HR & recruitment",
  coaching: "Coaching",
  expertise_b2b: "Expertise B2B",
};

function messageSteps(seq: OutreachSequence): SequenceStep[] {
  return seq.steps.filter((s) => s.kind !== "wait");
}

function campaignState(seq: OutreachSequence | undefined): CampaignState {
  if (!seq) return "not_built";
  if (seq.stoppedOnReply) return "replied";
  const msgs = messageSteps(seq).filter((s) => s.status !== "skipped");
  const ok = msgs.filter((s) => s.status === "approved" || s.status === "sent").length;
  if (msgs.length && ok === msgs.length) return "approved";
  return ok ? "partly" : "draft";
}

async function post<T = Record<string, unknown>>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong.");
  return data as T;
}

export function CampaignStudio({ initialLeads, initialSequences, bdrName, initialLeadId }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [sequences, setSequences] = useState(initialSequences);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [steer, setSteer] = useState("");

  const queue = useMemo(
    () =>
      leads
        .filter((l) => l.stage !== "disqualified")
        .sort((a, b) => Number(b.geoCode === "NL") - Number(a.geoCode === "NL") || b.icpScore - a.icpScore),
    [leads],
  );

  const seqByLead = useMemo(() => {
    const map = new Map<string, OutreachSequence>();
    for (const s of [...sequences].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      if (s.status !== "cancelled") map.set(s.leadId, s);
    }
    return map;
  }, [sequences]);

  const [activeId, setActiveId] = useState<string | null>(
    initialLeadId && queue.some((l) => l.id === initialLeadId) ? initialLeadId : (queue[0]?.id ?? null),
  );
  const lead = queue.find((l) => l.id === activeId) ?? null;
  const sequence = lead ? seqByLead.get(lead.id) : undefined;
  const arc = useMemo(() => (lead ? buildStoryArc(lead) : null), [lead]);

  const stats = useMemo(() => {
    const built = queue.filter((l) => seqByLead.has(l.id));
    const states = built.map((l) => campaignState(seqByLead.get(l.id)));
    const sent = sequences.reduce(
      (n, s) => n + s.steps.filter((st) => st.kind !== "wait" && st.status === "sent").length,
      0,
    );
    return [
      { label: "Leads in queue", value: queue.length },
      { label: "Campaigns built", value: built.length },
      { label: "Fully approved", value: states.filter((s) => s === "approved").length },
      { label: "Messages sent", value: sent },
      { label: "Replies", value: states.filter((s) => s === "replied").length },
      { label: "Demos booked", value: leads.filter((l) => l.stage === "demo_booked").length },
    ];
  }, [queue, seqByLead, sequences, leads]);

  function upsert(seq: OutreachSequence) {
    setSequences((prev) => [...prev.filter((s) => s.id !== seq.id), seq]);
  }

  async function guarded(fn: () => Promise<string | void>): Promise<boolean> {
    setBusy(true);
    setNotice(null);
    try {
      const msg = await fn();
      if (msg) setNotice({ tone: "ok", text: msg });
      return true;
    } catch (e) {
      setNotice({ tone: "error", text: e instanceof Error ? e.message : String(e) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const build = () =>
    guarded(async () => {
      if (!lead) return;
      const data = await post<{ sequence: OutreachSequence }>("/api/sequences", {
        action: "generate",
        leadId: lead.id,
      });
      upsert(data.sequence);
      return `Campaign drafted for ${lead.firmName}. Read it through and approve each line.`;
    });

  const stepAction = (action: StepAction, step: SequenceStep, edit?: { subject?: string; body?: string }) =>
    guarded(async () => {
      if (!sequence) return;
      const data = await post<{ sequence: OutreachSequence }>("/api/sequences", {
        action,
        sequenceId: sequence.id,
        stepId: step.id,
        subject: edit?.subject,
        body: edit?.body,
      });
      upsert(data.sequence);
    });

  const approveAll = () =>
    guarded(async () => {
      if (!sequence) return;
      let latest = sequence;
      for (const step of messageSteps(sequence)) {
        if (step.status !== "draft" && step.status !== "pending") continue;
        const data = await post<{ sequence: OutreachSequence }>("/api/sequences", {
          action: "approve_step",
          sequenceId: sequence.id,
          stepId: step.id,
        });
        latest = data.sequence;
      }
      upsert(latest);
      return "Every line approved. Nothing has been sent yet.";
    });

  const pushLinkedIn = () =>
    guarded(async () => {
      if (!sequence) return;
      const data = await post<{ note: string }>("/api/heyreach", { sequenceId: sequence.id });
      return data.note;
    });

  const recordReply = (channel: "linkedin" | "email") =>
    guarded(async () => {
      if (!sequence) return;
      const data = await post<{ sequence: OutreachSequence }>("/api/sequences", {
        action: "record_reply",
        sequenceId: sequence.id,
        channel,
      });
      upsert(data.sequence);
      const fresh = await fetch("/api/leads").then((r) => r.json());
      if (Array.isArray(fresh.leads)) setLeads(fresh.leads);
      return "Sequence stopped. Everything still scheduled was cancelled.";
    });

  const teach = () =>
    guarded(async () => {
      if (!lead || !steer.trim()) return;
      await post("/api/feedback", {
        action: "add",
        category: "company",
        text: steer.trim(),
        companyName: lead.firmName,
        leadId: lead.id,
        source: "ui",
      });
      setSteer("");
      return "Saved. The agent applies it from the next batch on.";
    });

  if (!queue.length) {
    return (
      <Panel className="p-10 text-center">
        <Inbox className="mx-auto size-8 text-slate-300" />
        <p className="mt-3 font-medium text-slate-800">No leads in the queue yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Pull the Dutch HubSpot tasks first, then come back here to build campaigns.
        </p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
          Go to Pipeline <ArrowRight className="size-4" />
        </Link>
      </Panel>
    );
  }

  const msgs = sequence ? messageSteps(sequence) : [];
  const live = msgs.filter((s) => s.status !== "skipped");
  const approvedCount = live.filter((s) => s.status === "approved" || s.status === "sent").length;
  const linkedInReady =
    !!sequence &&
    !sequence.stoppedOnReply &&
    msgs.some((s) => s.sendVia === "heyreach") &&
    msgs.filter((s) => s.sendVia === "heyreach" && s.status !== "skipped").every((s) => s.status === "approved" || s.status === "sent");
  const totalDays = sequence?.steps.reduce((d, s) => d + (s.kind === "wait" ? s.waitDays : 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Title + batch numbers */}
      <div className="space-y-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Sparkles className="size-4" /> Outreach agent
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Campaigns</h1>
          <p className="mt-1 max-w-2xl text-[15px] text-slate-600">
            Every lead gets its own LinkedIn + email sequence, written from their HubSpot note. You approve
            every line — nothing sends on its own, and a reply stops everything.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
              <p className="text-xl font-semibold tabular-nums text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Approve queue */}
        <aside className="min-w-0">
          <FieldLabel>Approve queue</FieldLabel>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {queue.map((l) => {
              const st = STATE_LABEL[campaignState(seqByLead.get(l.id))];
              const active = l.id === activeId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setActiveId(l.id);
                    setNotice(null);
                  }}
                  className={cn(
                    "flex min-w-[13rem] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition lg:min-w-0",
                    active
                      ? "border-emerald-300 bg-emerald-50/70 shadow-sm"
                      : "border-slate-200/80 bg-white hover:border-slate-300",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {initials(l.contactName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{l.firmName}</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={cn("size-1.5 rounded-full", st.dot)} />
                      {st.label}
                      {l.geoCode && <span className="text-slate-400">· {l.geoCode}</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {lead && arc && (
          <div className="min-w-0 space-y-5">
            {notice && (
              <div
                role="status"
                className={cn(
                  "rounded-xl px-4 py-3 text-sm",
                  notice.tone === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
                )}
              >
                {notice.text}
              </div>
            )}

            {/* Lead brief */}
            <Panel className="overflow-hidden">
              <div className="bg-[radial-gradient(120%_140%_at_0%_0%,#ecfdf5_0%,#ffffff_55%)] px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-base font-semibold text-white">
                      {initials(lead.firmName)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-slate-900">{lead.firmName}</h2>
                      <p className="truncate text-sm text-slate-600">
                        {lead.contactName} · {lead.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700 ring-1 ring-slate-200">{lead.location}</span>
                    {lead.vertical && VERTICAL_LABEL[lead.vertical] && (
                      <span className="rounded-full bg-white px-2.5 py-1 text-slate-700 ring-1 ring-slate-200">
                        {VERTICAL_LABEL[lead.vertical]}
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-600/10 px-2.5 py-1 font-medium text-emerald-800">
                      ICP {lead.icpScore}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
                  <div className="space-y-1.5">
                    <FieldLabel>The story every message tells</FieldLabel>
                    <p className="text-[15px] leading-relaxed text-slate-800">{arc.insight}</p>
                    {lead.crm?.whyGood && (
                      <p className="text-sm text-slate-500">HubSpot note: “{lead.crm.whyGood}”</p>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {[
                      { ok: Boolean(lead.crm?.whyGood || lead.crm?.rawNote || lead.notes), text: "HubSpot note" },
                      { ok: Boolean(lead.linkedInUrl), text: lead.linkedInUrl ? "LinkedIn profile" : "No LinkedIn — email only" },
                      { ok: Boolean(lead.email), text: "Email address" },
                      { ok: lead.icpScore >= 70, text: "Fits the ICP" },
                    ].map((c) => (
                      <li key={c.text} className="flex items-center gap-2 text-slate-700">
                        {c.ok ? (
                          <CircleCheck className="size-4 text-emerald-600" />
                        ) : (
                          <CircleDashed className="size-4 text-amber-500" />
                        )}
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>

            {/* Sequence */}
            <Panel>
              <PanelHeader
                title="Sequence"
                hint={
                  sequence
                    ? `${msgs.length} messages over ${totalDays} days · in ${bdrName.split(" ")[0]}’s voice`
                    : "Not built yet"
                }
                right={
                  sequence && (
                    <div className="w-40">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Approved</span>
                        <span className="tabular-nums">
                          {approvedCount}/{live.length}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${live.length ? (approvedCount / live.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )
                }
              />
              <div className="px-5 py-6">
                {sequence ? (
                  <MessageTimeline sequence={sequence} busy={busy} onAction={stepAction} />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <LinkedInIcon className="size-5 text-[#0a66c2]" />
                      <ArrowRight className="size-4" />
                      <Mail className="size-5 text-emerald-600" />
                    </div>
                    <p className="max-w-sm text-sm text-slate-600">
                      The agent writes a connection request, a LinkedIn message and up to three emails —
                      all on the one story above.
                    </p>
                    <Button
                      disabled={busy}
                      onClick={() => void build()}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <WandSparkles /> Write this campaign
                    </Button>
                  </div>
                )}
              </div>
              {sequence && !sequence.stoppedOnReply && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                  <p className="text-xs text-slate-500">
                    LinkedIn goes out through HeyReach, email from your Gmail. Nothing sends before you approve.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={busy || approvedCount === live.length} onClick={() => void approveAll()}>
                      <CheckCheck /> Approve all
                    </Button>
                    {msgs.some((s) => s.sendVia === "heyreach") && (
                      <Button
                        size="sm"
                        disabled={busy || !linkedInReady}
                        onClick={() => void pushLinkedIn()}
                        className="bg-[#0a66c2] text-white hover:bg-[#0a66c2]/90"
                      >
                        <Send /> Queue LinkedIn
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Panel>

            {/* Replies → demo */}
            {sequence && (
              <Panel>
                <PanelHeader
                  title="Replies"
                  hint={
                    sequence.stoppedOnReply
                      ? `Replied on ${sequence.stoppedOnReply.channel === "linkedin" ? "LinkedIn" : "email"} — the rest of the sequence was cancelled.`
                      : "The moment they reply on either channel, the sequence stops."
                  }
                  right={
                    !sequence.stoppedOnReply && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => void recordReply("linkedin")} aria-label="Replied on LinkedIn">
                          <LinkedInIcon className="size-3.5 text-[#0a66c2]" /> Replied
                        </Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => void recordReply("email")} aria-label="Replied by email">
                          <Mail /> Replied
                        </Button>
                      </div>
                    )
                  }
                />
                <ol className="grid gap-px overflow-hidden rounded-b-2xl bg-slate-100 sm:grid-cols-3">
                  {[
                    { icon: MessageCircle, title: "Agent reads the reply", text: "Book now, not yet, no, or confused — politeness is not a yes." },
                    { icon: Send, title: "Slack to you", text: "With the whole conversation and two Ludwig slots." },
                    { icon: CalendarCheck, title: "You book Ludwig", text: "Nothing books itself. HubSpot moves to Demo Booked after you confirm." },
                  ].map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="bg-white px-5 py-4">
                      <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
                          {i + 1}
                        </span>
                        <Icon className="size-4 text-slate-400" />
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{text}</p>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}

            {/* Steer the agent */}
            <Panel>
              <PanelHeader
                title="Steer the agent"
                hint="Wrong person, wrong angle, wrong tone? One sentence — the agent remembers it from the next batch on."
              />
              <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-end">
                <Textarea
                  value={steer}
                  onChange={(e) => setSteer(e.target.value)}
                  rows={2}
                  placeholder={`e.g. “Skip ${lead.firmName}, they already use an agency” or “Talk to the managing partner, not HR”`}
                  className="bg-white"
                />
                <Button disabled={busy || !steer.trim()} onClick={() => void teach()} className="shrink-0">
                  Remember this
                </Button>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}
