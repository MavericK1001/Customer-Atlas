import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const redirectUrl = new URL(next, process.env.NEXT_PUBLIC_APP_URL ?? url.origin);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = getSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  } catch {
    redirectUrl.searchParams.set("auth", "error");
  }

  return NextResponse.redirect(redirectUrl);
}