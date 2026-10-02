/** Geography defaults for Willow BDR — Belgium first, Netherlands second. BE + NL only. */

export type GeoCode = "BE" | "NL" | "OTHER";

export type GeoTier = "primary" | "secondary" | "out_of_scope";

/**
 * Default import / HubSpot filter: Belgium + Netherlands.
 * Belgium is primary (higher ICP bonus); Netherlands is secondary.
 * No other countries are in scope.
 */
export const DEFAULT_GEO_FILTER: GeoCode[] = ["BE", "NL"];

/** Markets Floor covers — hard lock. */
export const PRIMARY_GEO: GeoCode = "BE";
export const AVAILABLE_GEO: GeoCode[] = ["BE", "NL"];

/** @deprecated Use PRIMARY_GEO — kept so older call sites compile during rename. */
export const PILOT_GEO: GeoCode = PRIMARY_GEO;

export const GEO_LABELS: Record<GeoCode, string> = {
  BE: "Belgium",
  NL: "Netherlands",
  OTHER: "Other / out of scope",
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
};

const COUNTRY_PATTERNS: { re: RegExp; code: GeoCode }[] = [
  { re: /\b(belgium|belgi[eë]|belgique)\b/i, code: "BE" },
  { re: /\b(netherlands|nederland|holland)\b/i, code: "NL" },
];

export function detectGeoCode(...parts: (string | undefined | null)[]): GeoCode {
  const hay = parts.filter(Boolean).join(" ").trim();
  if (!hay) return "OTHER";

  const lower = hay.toLowerCase();
  for (const [city, code] of Object.entries(CITY_HINTS)) {
    if (lower.includes(city)) return code;
  }

  // Prefer trailing ", XX" country tokens — only BE/NL count
  const trailing = hay.match(/,\s*([A-Za-z]{2})\s*$/);
  if (trailing) {
    const cc = trailing[1].toUpperCase();
    if (cc === "BE" || cc === "NL") return cc;
    return "OTHER";
  }

  for (const { re, code } of COUNTRY_PATTERNS) {
    if (re.test(hay)) return code;
  }

  // Domain TLDs in company/email when location blank
  if (/\.be\b/i.test(hay)) return "BE";
  if (/\.nl\b/i.test(hay)) return "NL";

  return "OTHER";
}

export function geoTier(code: GeoCode): GeoTier {
  if (code === "BE") return "primary";
  if (code === "NL") return "secondary";
  return "out_of_scope";
}

/** ICP score bonus: Belgium primary, Netherlands secondary; all else zero. */
export function geoScoreBonus(code: GeoCode): number {
  switch (geoTier(code)) {
    case "primary":
      return 20;
    case "secondary":
      return 14;
    default:
      return 0;
  }
}

export function matchesGeoFilter(code: GeoCode, filter: GeoCode[]): boolean {
  if (filter.length === 0) return true;
  if (filter.includes(code)) return true;
  return false;
}

export function isInMarket(code: GeoCode): boolean {
  return code === "BE" || code === "NL";
}
