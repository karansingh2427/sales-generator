export type LeadStage =
  | "new"
  | "qualified"
  | "outreach_drafted"
  | "contacted"
  | "replied"
  | "demo_booked"
  | "disqualified";

export type LeadSource =
  | "sales_nav_csv"
  | "demo_sample"
  | "mock_apollo"
  | "linkedin_search"
  | "manual"
  | "referral";

export interface Lead {
  id: string;
  firmName: string;
  contactName: string;
  title: string;
  email: string;
  linkedInUrl?: string;
  location: string;
  practiceArea: string;
  firmSize: string;
  icpScore: number;
  stage: LeadStage;
  source: LeadSource;
  /** ISO-ish country code when known (BE/NL preferred). */
  geoCode?: string;
  notes?: string;
  lastTouchAt?: string;
  createdAt: string;
}

export type OutreachChannel = "email" | "linkedin_dm";

export interface OutreachDraft {
  id: string;
  leadId: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  rationale: string;
  createdAt: string;
}

export interface DemoBooking {
  id: string;
  leadId: string;
  aeName: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  notes?: string;
  status: "scheduled" | "completed" | "no_show" | "cancelled";
  createdAt: string;
}

export interface WorkspaceState {
  leads: Lead[];
  outreach: OutreachDraft[];
  bookings: DemoBooking[];
  bdrName: string;
  updatedAt: string;
}
