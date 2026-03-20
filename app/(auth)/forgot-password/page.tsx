"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function resetPassword() {
    setError(null);
    setMessage(null);

    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      return;
    }

    const redirectBase =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${redirectBase}/auth/callback?next=/reset-password`,
      },
    );

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Password reset link sent — check your email.");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void resetPassword();
    });
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">
          Reset your password
        </h1>
        <p className="text-sm text-white/40">
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/60">
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending || !email}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Send reset link
        </Button>
      </form>

      {message && (
        <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-center text-sm text-emerald-300">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-rose-500/10 p-3 text-center text-sm text-rose-300">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-white/30">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-violet-400 transition-colors hover:text-violet-300"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
