import { promises as fs } from "fs";
import path from "path";

/**
 * Workspace JSON lives under `.data/` locally.
 * On Vercel/serverless the deploy FS is read-only — use `/tmp` so the pilot
 * does not 500. Ephemeral across cold starts; fine for Floor's mock demo.
 */
let resolvedDir: string | null = null;

const TMP_DATA_DIR = "/tmp/sales-generator-data";
const LOCAL_DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), ".data");

function preferredDataDir(): string {
  if (process.env.SALES_GENERATOR_DATA_DIR?.trim()) {
    return path.resolve(
      /*turbopackIgnore: true*/ process.env.SALES_GENERATOR_DATA_DIR.trim(),
    );
  }
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return TMP_DATA_DIR;
  }
  return LOCAL_DATA_DIR;
}

export async function getDataDir(): Promise<string> {
  if (resolvedDir) return resolvedDir;

  const primary = preferredDataDir();
  try {
    await fs.mkdir(primary, { recursive: true });
    // Prove write works (read-only cwd on some hosts still allows mkdir no-op).
    const probe = path.join(/*turbopackIgnore: true*/ primary, ".write-probe");
    await fs.writeFile(probe, "ok", "utf8");
    await fs.unlink(probe).catch(() => undefined);
    resolvedDir = primary;
    return resolvedDir;
  } catch {
    await fs.mkdir(TMP_DATA_DIR, { recursive: true });
    resolvedDir = TMP_DATA_DIR;
    return resolvedDir;
  }
}

export async function dataFile(name: string): Promise<string> {
  const dir = await getDataDir();
  return path.join(/*turbopackIgnore: true*/ dir, name);
}
