"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthPanel({ userEmail }: { userEmail?: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState(userEmail ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function signIn() {
    setError(null);
    setMessage(null);

    let supabase;

    try {
      supabase = getSupabaseBrowserClient();
    } catch (clientError) {
      setError(
        clientError instanceof Error
          ? clientError.message
          : "Supabase is not configured.",
      );
      return;
    }

    const redirectBase =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectBase}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage(
      "Magic link sent. Open the email link to attach your dashboard session.",
    );
  }

  async function signOut() {
    setError(null);
    setMessage(null);

    let supabase;

    try {
      supabase = getSupabaseBrowserClient();
    } catch (clientError) {
      setError(
        clientError instanceof Error
          ? clientError.message
          : "Supabase is not configured.",
      );
      return;
    }

    const { error: authError } = await supabase.auth.signOut();

    if (authError) {
      setError(authError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Authentication
        </p>
        <p className="text-sm leading-relaxed text-white/40">
          {userEmail
            ? `Signed in as ${userEmail}. Your future analyses can be tied to your account.`
            : "Use an email magic link to persist analyses against your Supabase user account."}
        </p>
      </div>

      {userEmail ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              void signOut();
            });
          }}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign out
        </Button>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(() => {
              void signIn();
            });
          }}
        >
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border-white/10 bg-white text-slate-950"
          />
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isPending || !email}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send magic link
          </Button>
        </form>
      )}

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
