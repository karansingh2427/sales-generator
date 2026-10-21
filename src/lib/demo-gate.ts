/**
 * Shared-password gate for the hosted demo (Vercel).
 * Off unless DEMO_PASSWORD is set — local dev and Cowork use stay open.
 * The cookie holds a SHA-256 of the password, never the password itself.
 */
export const DEMO_COOKIE = "sg_demo";

export function demoPassword(): string | null {
  return process.env.DEMO_PASSWORD?.trim() || null;
}

export async function demoToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`sales-generator:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
