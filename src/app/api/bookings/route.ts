import { NextResponse } from "next/server";
import { addBooking, findLead, readState } from "@/lib/db";
import { DEFAULT_AES } from "@/lib/willow-context";

function validateBooking(body: unknown):
  | {
      ok: true;
      leadId: string;
      aeName: string;
      scheduledAt: string;
      durationMinutes: number;
      notes?: string;
    }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const b = body as Record<string, unknown>;
  const leadId = b.leadId;
  const aeName = b.aeName;
  const scheduledAt = b.scheduledAt;
  if (typeof leadId !== "string" || !leadId) return { ok: false, error: "leadId required" };
  const allowedAes: string[] = [...DEFAULT_AES];
  if (typeof aeName !== "string" || !allowedAes.includes(aeName)) {
    return { ok: false, error: `aeName must be one of: ${allowedAes.join(", ")}` };
  }
  if (typeof scheduledAt !== "string" || Number.isNaN(Date.parse(scheduledAt))) {
    return { ok: false, error: "scheduledAt must be ISO datetime" };
  }
  const durationMinutes = Number(b.durationMinutes) || 30;
  if (durationMinutes < 15 || durationMinutes > 60) {
    return { ok: false, error: "durationMinutes must be 15–60" };
  }
  const notes = typeof b.notes === "string" ? b.notes : undefined;
  return { ok: true, leadId, aeName, scheduledAt, durationMinutes, notes };
}

export async function GET() {
  const state = await readState();
  return NextResponse.json({ bookings: state.bookings, aes: DEFAULT_AES });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = validateBooking(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const lead = await findLead(parsed.leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.stage === "disqualified") {
    return NextResponse.json({ error: "Cannot book demo for disqualified lead" }, { status: 422 });
  }

  const meetingLink = `https://meet.willow.co/demo/${parsed.leadId.slice(-8)}`;
  const booking = await addBooking({
    leadId: parsed.leadId,
    aeName: parsed.aeName,
    scheduledAt: parsed.scheduledAt,
    durationMinutes: parsed.durationMinutes,
    meetingLink,
    notes: parsed.notes,
  });

  return NextResponse.json({ booking });
}
