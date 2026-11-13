"use client";

import { useState } from "react";
import type { OutreachSequence, SequenceStep } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { isActionStep, LINKEDIN_CONNECT_NOTE_MAX } from "@/lib/sequence-engine";
import { cn } from "@/lib/utils";
import { Check, Eye, GitBranch, Hourglass, Mail, Pencil, SkipForward, ThumbsUp, Undo2 } from "lucide-react";
import { LinkedInIcon } from "@/components/campaign/campaign-ui";

export type StepAction = "update_step" | "approve_step" | "skip_step";

type Props = {
  sequence: OutreachSequence;
  busy: boolean;
  onAction: (
    action: StepAction,
    step: SequenceStep,
    edit?: { subject?: string; body?: string },
  ) => Promise<boolean>;
};

type TimelineItem =
  | { type: "message"; step: SequenceStep; day: number; title: string }
  | { type: "action"; step: SequenceStep; day: number }
  | { type: "wait"; step: SequenceStep; days: number };

const TITLE: Partial<Record<SequenceStep["kind"], string>> = {
  linkedin_connect: "Connection request",
  linkedin_message: "LinkedIn message",
  linkedin_followup: "LinkedIn follow-up",
};

function buildTimeline(steps: SequenceStep[]): TimelineItem[] {
  let day = 0;
  let email = 0;
  const emails = steps.filter((s) => s.kind === "email").length;
  return steps.map((step) => {
    if (step.kind === "wait") {
      day += step.waitDays;
      return { type: "wait", step, days: step.waitDays };
    }
    if (isActionStep(step.kind)) return { type: "action", step, day };
    if (step.kind === "email") email += 1;
    const title =
      step.kind === "email" ? (emails > 1 ? `Email ${email}` : "Email") : (TITLE[step.kind] ?? "LinkedIn message");
    return { type: "message", step, day, title };
  });
}

/** Automatic LinkedIn action (profile visit, like) — nothing to write, only keep or skip. */
function ActionRow({
  item,
  busy,
  onAction,
}: {
  item: Extract<TimelineItem, { type: "action" }>;
  busy: boolean;
  onAction: Props["onAction"];
}) {
  const { step } = item;
  const skipped = step.status === "skipped";
  const Icon = step.kind === "linkedin_like" ? ThumbsUp : Eye;
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 pl-12 sm:pl-14">
      <div className="absolute left-[7px] top-0.5 flex size-[22px] items-center justify-center rounded-full bg-[#e8f1fb] text-[#0a66c2] ring-4 ring-white sm:left-[9px]">
        <Icon className="size-3" />
      </div>
      <p className={cn("text-sm text-slate-700", skipped && "text-slate-400 line-through")}>
        <span className="font-medium">{step.label}</span>
        <span className="ml-2 text-slate-500">Day {item.day} · automatic</span>
      </p>
      {step.status !== "sent" && (
        <Button
          size="xs"
          variant="ghost"
          disabled={busy}
          onClick={() => void onAction(skipped ? "update_step" : "skip_step", step)}
        >
          {skipped ? <Undo2 /> : <SkipForward />} {skipped ? "Keep" : "Skip"}
        </Button>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: SequenceStep["status"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    sent: { label: "Sent", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
    skipped: { label: "Skipped", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
  };
  const s = map[status] ?? { label: "Needs your OK", cls: "bg-amber-50 text-amber-700 ring-amber-200" };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", s.cls)}>
      {s.label}
    </span>
  );
}

function MessageCard({
  item,
  busy,
  onAction,
}: {
  item: Extract<TimelineItem, { type: "message" }>;
  busy: boolean;
  onAction: Props["onAction"];
}) {
  const { step } = item;
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(step.body ?? "");
  const [subject, setSubject] = useState(step.subject ?? "");
  const isLinkedIn = step.kind !== "email";
  const done = step.status === "sent" || step.status === "skipped";
  const tooLong = step.kind === "linkedin_connect" && body.length > LINKEDIN_CONNECT_NOTE_MAX;

  async function run(action: StepAction) {
    const edit = editing ? { subject: step.kind === "email" ? subject : undefined, body } : undefined;
    const ok = await onAction(action, step, edit);
    if (ok) setEditing(false);
  }

  function startEdit() {
    setBody(step.body ?? "");
    setSubject(step.subject ?? "");
    setEditing(true);
  }

  return (
    <div className="relative pl-12 sm:pl-14">
      <div
        className={cn(
          "absolute left-0 top-0 flex size-9 items-center justify-center rounded-full shadow-sm ring-4 ring-white sm:size-10",
          isLinkedIn ? "bg-[#0a66c2] text-white" : "bg-emerald-50 text-emerald-700",
        )}
      >
        {isLinkedIn ? <LinkedInIcon className="size-4" /> : <Mail className="size-4" />}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[15px] font-semibold text-slate-800">
          {item.title}
          <span className="ml-2 font-normal text-slate-500">
            Day {item.day} · {isLinkedIn ? "LinkedIn" : "email"} via Lemlist
          </span>
        </p>
        <StatusPill status={step.status} />
      </div>
      {step.condition && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <GitBranch className="size-3.5 text-slate-400" /> {step.condition}
        </p>
      )}

      <div className="mt-3">
        {editing ? (
          <div className="space-y-2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
            {step.kind === "email" && (
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                aria-label="Subject"
                className="bg-white"
              />
            )}
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={step.kind === "email" ? 9 : 4}
              aria-label="Message"
              className="bg-white text-[15px] leading-relaxed"
            />
            {step.kind === "linkedin_connect" && (
              <p className={cn("text-right text-xs", tooLong ? "text-red-600" : "text-slate-500")}>
                {body.length}/{LINKEDIN_CONNECT_NOTE_MAX} characters
              </p>
            )}
          </div>
        ) : isLinkedIn ? (
          <div
            className={cn(
              "max-w-xl whitespace-pre-line rounded-2xl rounded-tl-md bg-[#e8f1fb] px-4 py-3 text-[15px] leading-relaxed text-slate-800",
              step.status === "skipped" && "opacity-50 line-through",
            )}
          >
            {step.body}
          </div>
        ) : (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
              step.status === "skipped" && "opacity-50",
            )}
          >
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-sm text-slate-600">
              <span className="text-slate-400">Subject</span>{" "}
              <span className="font-medium text-slate-800">{step.subject}</span>
            </div>
            <p className="whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed text-slate-700">
              {step.body}
            </p>
          </div>
        )}
      </div>

      {!done && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {step.status !== "approved" || editing ? (
            <Button
              size="sm"
              disabled={busy || tooLong}
              onClick={() => void run("approve_step")}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check /> {editing ? "Save & approve" : "Approve"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void run("update_step")}>
              <Undo2 /> Undo approval
            </Button>
          )}
          {editing ? (
            <>
              <Button size="sm" variant="outline" disabled={busy || tooLong} onClick={() => void run("update_step")}>
                Save draft
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" disabled={busy} onClick={startEdit}>
              <Pencil /> Edit
            </Button>
          )}
          {!editing && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void run("skip_step")}>
              <SkipForward /> Skip
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function MessageTimeline({ sequence, busy, onAction }: Props) {
  const items = buildTimeline(sequence.steps);
  return (
    <div className="relative space-y-7">
      <div className="absolute bottom-6 left-[17px] top-6 w-px bg-gradient-to-b from-[#0a66c2]/40 via-emerald-300 to-emerald-100 sm:left-[19px]" />
      {items.map((item) =>
        item.type === "wait" ? (
          <div key={item.step.id} className="relative flex items-center gap-2 pl-12 text-sm text-slate-500 sm:pl-14">
            <Hourglass className="size-3.5 text-slate-400" />
            {item.days} {item.days === 1 ? "day" : "days"} later, only if they stay quiet
          </div>
        ) : item.type === "action" ? (
          <ActionRow key={item.step.id} item={item} busy={busy} onAction={onAction} />
        ) : (
          <MessageCard key={`${item.step.id}-${item.step.status}`} item={item} busy={busy} onAction={onAction} />
        ),
      )}
    </div>
  );
}
