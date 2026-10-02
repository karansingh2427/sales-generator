import { promises as fs } from "fs";
import path from "path";
import os from "os";

/**
 * Workspace JSON lives under `.data/` locally.
 * On Vercel/serverless the deploy FS is read-only — use `/tmp` so the pilot
 * does not 500. Ephemeral across cold starts; fine for Floor's mock demo.
 */
let resolvedDir: string | null = null;

function preferredDataDir(): string {
  if (process.env.SALES_GENERATOR_DATA_DIR?.trim()) {
    return path.resolve(process.env.SALES_GENERATOR_DATA_DIR.trim());
  }
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "sales-generator-data");
  }
  return path.join(process.cwd(), ".data");
}

export async function getDataDir(): Promise<string> {
  if (resolvedDir) return resolvedDir;

  const primary = preferredDataDir();
  try {
    await fs.mkdir(primary, { recursive: true });
    // Prove write works (read-only cwd on some hosts still allows mkdir no-op).
    const probe = path.join(primary, ".write-probe");
    await fs.writeFile(probe, "ok", "utf8");
    await fs.unlink(probe).catch(() => undefined);
    resolvedDir = primary;
    return resolvedDir;
  } catch {
    const fallback = path.join(os.tmpdir(), "sales-generator-data");
    await fs.mkdir(fallback, { recursive: true });
    resolvedDir = fallback;
    return resolvedDir;
  }
}

export async function dataFile(name: string): Promise<string> {
  return path.join(await getDataDir(), name);
}
