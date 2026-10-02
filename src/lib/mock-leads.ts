import type { Lead } from "@/types/sales";
import { detectGeoCode } from "@/lib/geo";

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
    icpScore: 94,
    stage: "new",
    source: "demo_sample",
    geoCode: "NL",
    vertical: "legal",
    socialPresence: "inconsistent",
    notes: "Active on LinkedIn; last post 8 weeks ago. Demo sample — not live HubSpot.",
    crm: {
      whyGood: "Litigation-adjacent corporate firm; inconsistent posting cadence.",
      opener: "Consistency gap vs peer NL firms — quarterly calendar angle.",
      rightContact: "Sophie Van der Berg (Managing Partner)",
    },
  },
  {
    firmName: "Advocatenkantoor De Clercq",
    contactName: "Pieter De Clercq",
    title: "Partner",
    email: "p.declercq@declercq-advocaten.be",
    linkedInUrl: "https://www.linkedin.com/in/example-pieter-declercq",
    location: "Brussels, BE",
    practiceArea: "Litigation",
    firmSize: "25–50",
    icpScore: 93,
    stage: "qualified",
    source: "demo_sample",
    geoCode: "BE",
    vertical: "legal",
    socialPresence: "weak",
  },
  {
    firmName: "Bureau Lemaire Avocats",
    contactName: "Camille Lemaire",
    title: "Associée",
    email: "c.lemaire@lemaire-avocats.be",
    location: "Ghent, BE",
    practiceArea: "Employment",
    firmSize: "10–25",
    icpScore: 88,
    stage: "new",
    source: "demo_sample",
    geoCode: "BE",
    vertical: "legal",
    socialPresence: "weak",
  },
  {
    firmName: "Horizon Coaching Collective",
    contactName: "Anouk Vermeer",
    title: "Founder",
    email: "a.vermeer@horizoncoach.nl",
    linkedInUrl: "https://www.linkedin.com/in/example-anouk-vermeer",
    location: "Rotterdam, NL",
    practiceArea: "Coaching / Advisory",
    firmSize: "10–25",
    icpScore: 90,
    stage: "new",
    source: "demo_sample",
    geoCode: "NL",
    vertical: "coaching",
    socialPresence: "inconsistent",
    crm: {
      whyGood: "Coaching firm — expertise B2B; content mix is promo-only.",
      opener: "Content mix: buyers want founder POV, not only offers.",
      rightContact: "Anouk Vermeer (Founder)",
    },
  },
  {
    firmName: "Hoffmann Rechtsanwälte",
    contactName: "Thomas Hoffmann",
    title: "Senior Partner",
    email: "t.hoffmann@hoffmann-law.de",
    location: "Berlin, DE",
    practiceArea: "IP / Tech",
    firmSize: "25–50",
    icpScore: 78,
    stage: "outreach_drafted",
    source: "demo_sample",
    geoCode: "DE",
    vertical: "legal",
    socialPresence: "unknown",
    notes: "Nearby EU — secondary to BE/NL unless Floor expands geo filter.",
  },
  {
    firmName: "Clarke & Doyle LLP",
    contactName: "Emily Clarke",
    title: "Operations Manager",
    email: "e.clarke@clarkedoyle.com",
    location: "Dublin, IE",
    practiceArea: "General practice",
    firmSize: "100+",
    icpScore: 76,
    stage: "contacted",
    source: "demo_sample",
    geoCode: "IE",
    vertical: "legal",
    socialPresence: "inconsistent",
    lastTouchAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    firmName: "Solo Notaris Jansen",
    contactName: "Mark Jansen",
    title: "Notaris",
    email: "m.jansen@solo-notaris.example",
    location: "Utrecht, NL",
    practiceArea: "Family",
    firmSize: "1–5",
    icpScore: 58,
    stage: "disqualified",
    source: "manual",
    geoCode: "NL",
    vertical: "legal",
    notes: "Solo practitioner — below firm-size ICP.",
  },
  {
    firmName: "Antwerp Corporate Counsel",
    contactName: "Liesbeth Peeters",
    title: "Managing Partner",
    email: "l.peeters@acc-advocaten.be",
    location: "Antwerp, BE",
    practiceArea: "Corporate / M&A",
    firmSize: "25–50",
    icpScore: 95,
    stage: "replied",
    source: "demo_sample",
    geoCode: "BE",
    vertical: "legal",
    socialPresence: "weak",
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

/** Labeled Demo / sample data fallback when Floor has no HubSpot/CSV handy. */
export function generateMockLead(filters: {
  practiceArea?: string;
  minScore?: number;
  geoBias?: boolean;
}): Lead {
  const areas = [
    "Corporate / M&A",
    "Accountancy",
    "IT / SaaS",
    "HR / Executive search",
    "Coaching / Advisory",
  ];
  const cities = [
    ["Brussels", "BE"],
    ["Ghent", "BE"],
    ["Antwerp", "BE"],
    ["Amsterdam", "NL"],
    ["Rotterdam", "NL"],
    ["Utrecht", "NL"],
  ] as const;
  const titles = ["Partner", "Founder", "Operations Manager", "Managing Partner"];
  const [city, country] = cities[Math.floor(Math.random() * cities.length)];
  const practice =
    filters.practiceArea && filters.practiceArea !== "any"
      ? filters.practiceArea
      : areas[Math.floor(Math.random() * areas.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const score = Math.min(
    98,
    Math.max(filters.minScore ?? 70, 80 + Math.floor(Math.random() * 18)),
  );
  const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const suffix = id.slice(-4);
  return {
    id,
    firmName: `${city} Expertise Co ${suffix}`,
    contactName: "Alex Morgan",
    title,
    email: `alex.morgan@${city.toLowerCase().replace(/\s/g, "")}expertise.example`,
    linkedInUrl: `https://www.linkedin.com/in/example-${suffix}`,
    location: `${city}, ${country}`,
    practiceArea: practice,
    firmSize: "25–50",
    icpScore: score,
    stage: "new",
    source: "demo_sample",
    geoCode: detectGeoCode(`${city}, ${country}`),
    vertical: "expertise_b2b",
    socialPresence: "weak",
    notes: "Demo / sample data — replace with HubSpot sync for live CRM notes.",
    crm: {
      whyGood: "Demo lead — weak social presence, decision-maker title.",
      opener: "Consistency + visibility angles for expertise B2B.",
      rightContact: `Alex Morgan (${title})`,
    },
    createdAt: new Date().toISOString(),
  };
}
