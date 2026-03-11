import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

type HealthStatus = "ok" | "degraded";

const REQUIRED_ENV_KEYS: Array<keyof typeof env> = [
  "DATABASE_URL",
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
];

export async function GET(): Promise<NextResponse> {
  const missingEnv = REQUIRED_ENV_KEYS.filter((key) => {
    const value = env[key];
    return !value || value.trim().length === 0;
  });

  let databaseOk = false;
  let databaseError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch (error) {
    databaseError = (error as Error).message;
  }

  const status: HealthStatus =
    missingEnv.length === 0 && databaseOk ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      checks: {
        env: {
          ok: missingEnv.length === 0,
          missing: missingEnv,
        },
        database: {
          ok: databaseOk,
          error: databaseError,
        },
      },
      timestamp: new Date().toISOString(),
    },
    { status: status === "ok" ? 200 : 503 },
  );
}
