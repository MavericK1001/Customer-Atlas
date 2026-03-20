"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function signUp() {
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured.");
      return;
    }

    const redirectBase =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectBase}/auth/callback?next=/dashboard`,
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage(
      "Account created! Check your email to confirm, then you can sign in.",
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void signUp();
    });
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">
          Create your account
        </h1>
        <p className="text-sm text-white/40">
          Start analyzing websites in under a minute
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

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-white/60"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              minLength={8}
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

        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-white/60"
          >
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !email || !password || !confirmPassword}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-violet-400 transition-colors hover:text-violet-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
