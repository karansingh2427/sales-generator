/** Geography defaults for Willow BDR — Floor’s book is BE + NL first. */

export type GeoCode = "BE" | "NL" | "LU" | "DE" | "FR" | "UK" | "IE" | "CH" | "OTHER";

export type GeoTier = "core" | "benelux" | "nearby_eu" | "other";

/** Default import filter: Belgium + Netherlands. */
export const DEFAULT_GEO_FILTER: GeoCode[] = ["BE", "NL"];

export const GEO_LABELS: Record<GeoCode, string> = {
  BE: "Belgium",
  NL: "Netherlands",
  LU: "Luxembourg",
  DE: "Germany",
  FR: "France",
  UK: "United Kingdom",
  IE: "Ireland",
  CH: "Switzerland",
  OTHER: "Other / unknown",
};

const CITY_HINTS: Record<string, GeoCode> = {
  brussels: "BE",
  bruxelles: "BE",
  brussel: "BE",
  antwerp: "BE",
  antwerpen: "BE",
  anvers: "BE",
  ghent: "BE",
  gent: "BE",
  gand: "BE",
  bruges: "BE",
  brugge: "BE",
  leuven: "BE",
  liege: "BE",
  "liège": "BE",
  namur: "BE",
  charleroi: "BE",
  amsterdam: "NL",
  rotterdam: "NL",
  utrecht: "NL",
  "the hague": "NL",
  denhaag: "NL",
  "den haag": "NL",
  eindhoven: "NL",
  groningen: "NL",
  tilburg: "NL",
  haarlem: "NL",
  leiden: "NL",
  maastricht: "NL",
  luxembourg: "LU",
  berlin: "DE",
  munich: "DE",
  münchen: "DE",
  hamburg: "DE",
  frankfurt: "DE",
  cologne: "DE",
  köln: "DE",
  düsseldorf: "DE",
  paris: "FR",
  lyon: "FR",
  lille: "FR",
  london: "UK",
  manchester: "UK",
  birmingham: "UK",
  edinburgh: "UK",
  dublin: "IE",
  zurich: "CH",
  zürich: "CH",
  geneva: "CH",
};

const COUNTRY_PATTERNS: { re: RegExp; code: GeoCode }[] = [
  { re: /\b(belgium|belgi[eë]|belgique|be)\b/i, code: "BE" },
  { re: /\b(netherlands|nederland|holland|nl)\b/i, code: "NL" },
  { re: /\b(luxembourg|luxemburg|lu)\b/i, code: "LU" },
  { re: /\b(germany|deutschland|de)\b/i, code: "DE" },
  { re: /\b(france|frankrijk|fr)\b/i, code: "FR" },
  { re: /\b(united kingdom|great britain|england|scotland|wales|uk|gb)\b/i, code: "UK" },
  { re: /\b(ireland|éire|ie)\b/i, code: "IE" },
  { re: /\b(switzerland|schweiz|suisse|ch)\b/i, code: "CH" },
];

export function detectGeoCode(...parts: (string | undefined | null)[]): GeoCode {
  const hay = parts.filter(Boolean).join(" ").trim();
  if (!hay) return "OTHER";

  const lower = hay.toLowerCase();
  for (const [city, code] of Object.entries(CITY_HINTS)) {
    if (lower.includes(city)) return code;
  }

  // Prefer trailing ", XX" country tokens
  const trailing = hay.match(/,\s*([A-Za-z]{2})\s*$/);
  if (trailing) {
    const cc = trailing[1].toUpperCase();
    if (cc in GEO_LABELS && cc !== "OTHER") return cc as GeoCode;
  }

  for (const { re, code } of COUNTRY_PATTERNS) {
    if (re.test(hay)) return code;
  }

  // Domain TLDs in company/email when location blank
  if (/\.be\b/i.test(hay)) return "BE";
  if (/\.nl\b/i.test(hay)) return "NL";
  if (/\.lu\b/i.test(hay)) return "LU";

  return "OTHER";
}

export function geoTier(code: GeoCode): GeoTier {
  if (code === "BE" || code === "NL") return "core";
  if (code === "LU") return "benelux";
  if (code === "DE" || code === "FR" || code === "UK" || code === "IE" || code === "CH")
    return "nearby_eu";
  return "other";
}

/** ICP score bonus: core BE/NL highest, then Benelux, nearby EU, else 0. */
export function geoScoreBonus(code: GeoCode): number {
  switch (geoTier(code)) {
    case "core":
      return 18;
    case "benelux":
      return 12;
    case "nearby_eu":
      return 6;
    default:
      return 0;
  }
}

export function matchesGeoFilter(code: GeoCode, filter: GeoCode[]): boolean {
  if (filter.length === 0) return true;
  if (filter.includes(code)) return true;
  // "OTHER" only matches if explicitly selected
  return false;
}
