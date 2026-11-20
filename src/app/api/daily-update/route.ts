import { NextResponse } from "next/server";
import { readState } from "@/lib/db";
import { buildDailyUpdate } from "@/lib/daily-update";

/** Floor's weekday 08:30 update, built from the web-app workspace. Read-only — posting to Slack is the skill's job. */
export async function GET() {
  const state = await readState();
  return NextResponse.json(buildDailyUpdate(state));
}
