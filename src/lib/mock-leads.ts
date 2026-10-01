import type { Lead } from "@/types/sales";

const BASE: Omit<Lead, "id" | "createdAt">[] = [
  {
    firmName: "Van der Berg & Partners",
    contactName: "Sophie Van der Berg",
    title: "Managing Partner",
    email: "s.vanderberg@vdbpartners.nl",
    linkedInUrl: "https://www.linkedin.com/in/example-sophie-vdb",
    location: "Amsterdam, NL",
    practiceArea: "Corporate / M&A",
    firmSize: "25–50",
    icpScore: 92,
    stage: "new",
    source: "mock_apollo",
    notes: "Active on LinkedIn; last post 8 weeks ago.",
  },
  {
    firmName: "Lexington Legal Group",
    contactName: "James Whitfield",
    title: "Head of Marketing",
    email: "j.whitfield@lexingtonlegal.com",
    linkedInUrl: "https://www.linkedin.com/in/example-james-whitfield",
    location: "London, UK",
    practiceArea: "Litigation",
    firmSize: "50–100",
    icpScore: 88,
    stage: "qualified",
    source: "linkedin_search",
  },
  {
    firmName: "Studio Legale Ferraro",
    contactName: "Giulia Ferraro",
    title: "Partner",
    email: "g.ferraro@ferrarolegal.it",
    location: "Milan, IT",
    practiceArea: "Employment",
    firmSize: "10–25",
    icpScore: 85,
    stage: "new",
    source: "mock_apollo",
  },
  {
    firmName: "Northbridge Solicitors",
    contactName: "Aisha Khan",
    title: "Practice Manager",
    email: "a.khan@northbridgesolicitors.co.uk",
    location: "Manchester, UK",
    practiceArea: "Real estate",
    firmSize: "10–25",
    icpScore: 79,
    stage: "new",
    source: "referral",
    notes: "Referred by existing Willow customer (ACS Accountants network).",
  },
  {
    firmName: "Hoffmann Rechtsanwälte",
    contactName: "Thomas Hoffmann",
    title: "Senior Partner",
    email: "t.hoffmann@hoffmann-law.de",
    location: "Berlin, DE",
    practiceArea: "IP / Tech",
    firmSize: "25–50",
    icpScore: 90,
    stage: "outreach_drafted",
    source: "mock_apollo",
  },
  {
    firmName: "Clarke & Doyle LLP",
    contactName: "Emily Clarke",
    title: "Marketing Director",
    email: "e.clarke@clarkedoyle.com",
    location: "Dublin, IE",
    practiceArea: "General practice",
    firmSize: "100+",
    icpScore: 94,
    stage: "contacted",
    source: "linkedin_search",
    lastTouchAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    firmName: "Bureau Avocats Lemaire",
    contactName: "Camille Lemaire",
    title: "Associée",
    email: "c.lemaire@lemaire-avocats.fr",
    location: "Lyon, FR",
    practiceArea: "Family",
    firmSize: "5–10",
    icpScore: 62,
    stage: "disqualified",
    source: "manual",
    notes: "Solo practitioner — below firm-size ICP.",
  },
  {
    firmName: "Pinnacle Law Chambers",
    contactName: "David Okonkwo",
    title: "Managing Partner",
    email: "d.okonkwo@pinnaclelaw.co.uk",
    location: "Birmingham, UK",
    practiceArea: "Corporate / M&A",
    firmSize: "25–50",
    icpScore: 91,
    stage: "replied",
    source: "mock_apollo",
    lastTouchAt: new Date(Date.now() - 86400000).toISOString(),
    notes: "Asked for demo next week — warm.",
  },
];

export function seedLeads(): Lead[] {
  const now = Date.now();
  return BASE.map((lead, i) => ({
    ...lead,
    id: `lead_${i + 1}`,
    createdAt: new Date(now - i * 3600000).toISOString(),
  }));
}

export function generateMockLead(filters: {
  practiceArea?: string;
  minScore?: number;
}): Lead {
  const areas = [
    "Corporate / M&A",
    "Litigation",
    "Employment",
    "Real estate",
    "IP / Tech",
  ];
  const cities = [
    ["Brussels", "BE"],
    ["Ghent", "BE"],
    ["Rotterdam", "NL"],
    ["Zurich", "CH"],
    ["Edinburgh", "UK"],
  ] as const;
  const [city, country] = cities[Math.floor(Math.random() * cities.length)];
  const practice =
    filters.practiceArea && filters.practiceArea !== "any"
      ? filters.practiceArea
      : areas[Math.floor(Math.random() * areas.length)];
  const score = Math.min(
    98,
    Math.max(filters.minScore ?? 70, 72 + Math.floor(Math.random() * 25)),
  );
  const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const suffix = id.slice(-4);
  return {
    id,
    firmName: `${city} Legal Collective ${suffix}`,
    contactName: "Alex Morgan",
    title: "Head of Marketing",
    email: `alex.morgan@${city.toLowerCase().replace(/\s/g, "")}legal.example`,
    linkedInUrl: `https://www.linkedin.com/in/example-${suffix}`,
    location: `${city}, ${country}`,
    practiceArea: practice,
    firmSize: "25–50",
    icpScore: score,
    stage: "new",
    source: "mock_apollo",
    createdAt: new Date().toISOString(),
  };
}
