"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getSupabase() {
    try {
      return getSupabaseBrowserClient();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      return null;
    }
  }

  async function signInWithPassword() {
    setError(null);
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function signInWithMagicLink() {
    setError(null);
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) return;

    const redirectBase =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectBase}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Check your email — we sent you a magic link to sign in.");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      if (mode === "password") {
        void signInWithPassword();
      } else {
        void signInWithMagicLink();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">
          Welcome back
        </h1>
        <p className="text-sm text-white/40">
          Sign in to your FirstVisit account
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

        {mode === "password" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/60"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-violet-400 transition-colors hover:text-violet-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !email || (mode === "password" && !password)}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : mode === "magic-link" ? (
            <Mail className="mr-2 h-4 w-4" />
          ) : null}
          {mode === "password" ? "Sign in" : "Send magic link"}
        </Button>
      </form>

      {/* Toggle auth mode */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setMode(mode === "password" ? "magic-link" : "password");
            setError(null);
            setMessage(null);
          }}
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          {mode === "password"
            ? "Use magic link instead"
            : "Use password instead"}
        </button>
      </div>

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

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-white/30">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-violet-400 transition-colors hover:text-violet-300"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
