export type LeadStage =
  | "new"
  | "qualified"
  | "outreach_drafted"
  | "contacted"
  | "replied"
  | "demo_booked"
  /** Post–Demo Booked outcomes Floor confirmed (HubSpot). */
  | "demo_completed"
  | "demo_rescheduled"
  | "demo_cancelled"
  | "disqualified";

/** Stages after Demo Booked — Floor: “Completed, Rescheduled or Cancelled. That's it.” */
export const POST_DEMO_STAGES: LeadStage[] = [
  "demo_completed",
  "demo_rescheduled",
  "demo_cancelled",
];

export type LeadSource =
  | "hubspot"
  | "sales_nav_csv"
  | "demo_sample"
  | "mock_apollo"
  | "linkedin_search"
  | "manual"
  | "referral";

/** Social presence quality from CRM agent notes or scoring. */
export type SocialPresenceSignal = "weak" | "inconsistent" | "strong" | "unknown";

export type ExpertiseVertical =
  | "legal"
  | "accountancy"
  | "it"
  | "hr_recruitment"
  | "coaching"
  | "expertise_b2b"
  | "other";

export interface CrmAgentContext {
  /** Why this is a good/important lead (from lead-gen agent note). */
  whyGood?: string;
  /** Suggested opener from the agent. */
  opener?: string;
  /** Confirmed right person to contact. */
  rightContact?: string;
  /** Raw CRM note body when property map is incomplete. */
  rawNote?: string;
}

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
  /** ISO-ish country code when known (BE primary / NL secondary only). */
  geoCode?: string;
  notes?: string;
  lastTouchAt?: string;
  createdAt: string;
  /** Expertise-driven vertical (Floor ICP). */
  vertical?: ExpertiseVertical;
  /** Weak/inconsistent = pursue; strong = skip / DQ. */
  socialPresence?: SocialPresenceSignal;
  /** CRM agent fields (HubSpot notes / properties). */
  crm?: CrmAgentContext;
  hubspotContactId?: string;
  hubspotCompanyId?: string;
  hubspotDealId?: string;
  hubspotStageLabel?: string;
}

export type OutreachChannel = "email" | "linkedin_dm" | "linkedin_connect";

export type OutreachDraftStatus = "draft" | "approved" | "sent" | "skipped";

export interface OutreachDraft {
  id: string;
  leadId: string;
  channel: OutreachChannel;
  subject?: string;
  body: string;
  rationale: string;
  createdAt: string;
  status?: OutreachDraftStatus;
  sequenceId?: string;
  stepIndex?: number;
}

export type SequenceStepKind =
  | "linkedin_connect"
  | "linkedin_message"
  | "wait"
  | "linkedin_followup"
  | "email";

export type SequenceStepStatus =
  | "pending"
  | "draft"
  | "approved"
  | "sent"
  | "skipped"
  | "waiting";

export interface SequenceStep {
  id: string;
  kind: SequenceStepKind;
  label: string;
  /** Delay after previous step before this one is due (days). Wait steps use this as the wait length. */
  waitDays: number;
  channel?: OutreachChannel;
  subject?: string;
  body?: string;
  rationale?: string;
  status: SequenceStepStatus;
  approvedAt?: string;
  sentAt?: string;
  outreachDraftId?: string;
}

export type SequenceStatus = "draft" | "active" | "completed" | "cancelled";

export interface OutreachSequence {
  id: string;
  leadId: string;
  name: string;
  status: SequenceStatus;
  steps: SequenceStep[];
  opportunityAngles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DemoBooking {
  id: string;
  leadId: string;
  aeName: string;
  scheduledAt: string;
  durationMinutes: number;
  /** Per-AE calendar booking URL (not a shared Calendly). */
  meetingLink: string;
  notes?: string;
  status: "scheduled" | "completed" | "rescheduled" | "cancelled" | "no_show";
  createdAt: string;
}

export interface HubSpotStageMap {
  /** HubSpot deal/lifecycle stage labels → internal LeadStage */
  [hubspotLabel: string]: LeadStage;
}

/**
 * Optional structured properties when present on Company (preferred) or Contact.
 * Floor’s lead-gen agent primarily leaves a **company-level HubSpot note**
 * (why-good / opener / right contact in the note body) — not contact-only.
 */
export interface HubSpotPropertyMap {
  whyGood: string;
  opener: string;
  rightContact: string;
  socialPresence: string;
  vertical: string;
}

export interface HubSpotConfig {
  mode: "mock" | "live";
  stageMap: HubSpotStageMap;
  propertyMap: HubSpotPropertyMap;
  lastSyncAt?: string;
}

export interface WorkspaceState {
  leads: Lead[];
  outreach: OutreachDraft[];
  bookings: DemoBooking[];
  sequences: OutreachSequence[];
  hubspot: HubSpotConfig;
  bdrName: string;
  updatedAt: string;
}

/** Floor feedback categories — ICP, client, tone, geo, sequence quality, etc. */
export type FeedbackCategory =
  | "icp"
  | "company"
  | "contact"
  | "messaging_tone"
  | "disqualifier"
  | "geo"
  | "sequence_quality"
  | "title_preference"
  | "other";

export type FeedbackSource = "ui" | "skill" | "teach_lead";

export type FeedbackTargetType =
  | "company"
  | "contact"
  | "lead"
  | "title"
  | "geo"
  | "vertical"
  | "general";

export interface FeedbackTarget {
  type: FeedbackTargetType;
  /** Display name (firm, contact, title, etc.). */
  name: string;
  leadId?: string;
  hubspotCompanyId?: string;
}

/**
 * Structured instruction the engine can apply on later HubSpot pulls / drafts.
 * Free-text always kept in `FeedbackEntry.text`; instruction is optional parse aid.
 */
export type FeedbackInstruction =
  | { kind: "skip_company"; companyName: string }
  | { kind: "prefer_title"; titles: string[] }
  | { kind: "never_pitch"; topic: string }
  | { kind: "icp_tweak"; note: string }
  | { kind: "tone"; note: string }
  | { kind: "disqualify_pattern"; pattern: string }
  | { kind: "geo_note"; note: string }
  | { kind: "sequence_note"; note: string }
  | { kind: "freeform" };

export interface FeedbackEntry {
  id: string;
  category: FeedbackCategory;
  target?: FeedbackTarget;
  instruction: FeedbackInstruction;
  /** Free-text Floor wrote (always persisted). */
  text: string;
  active: boolean;
  source: FeedbackSource;
  createdAt: string;
  updatedAt: string;
  disabledAt?: string;
}

export interface FeedbackStore {
  version: 1;
  entries: FeedbackEntry[];
  updatedAt: string;
}

/** Result of applying active feedback to a lead set / draft context. */
export interface FeedbackApplication {
  skippedLeadIds: string[];
  skippedCompanies: string[];
  preferredTitles: string[];
  neverPitchTopics: string[];
  toneNotes: string[];
  icpNotes: string[];
  sequenceNotes: string[];
  geoNotes: string[];
  disqualifyPatterns: string[];
  /** Human-readable bullets for digests / skill prompts. */
  digestLines: string[];
  appliedEntryIds: string[];
}
