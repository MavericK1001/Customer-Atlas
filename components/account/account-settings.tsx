"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  LogOut,
  Eye,
  EyeOff,
  User,
  Shield,
  ArrowLeft,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AccountSettings({
  email,
  userId,
  createdAt,
  planName,
  usedThisMonth,
  analysesPerMonth,
}: {
  email: string;
  userId: string;
  createdAt: string;
  planName: string;
  usedThisMonth: number;
  analysesPerMonth: number;
}) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updatePassword() {
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
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

    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Password updated successfully.");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function signOut() {
    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Back to dashboard */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Profile section */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
            <User className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Profile
            </h2>
            <p className="text-sm text-white/40">Your account details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">
              Email
            </p>
            <p className="mt-1 text-sm text-white">{email}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                User ID
              </p>
              <p className="mt-1 truncate text-sm text-white/60 font-mono">
                {userId}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                Member since
              </p>
              <p className="mt-1 text-sm text-white/60">{memberSince}</p>
            </div>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                Plan &amp; Usage
              </p>
              <p className="mt-1 text-sm text-white/60">
                {planName} &middot;{" "}
                {analysesPerMonth === -1
                  ? `${usedThisMonth} used`
                  : `${usedThisMonth}/${analysesPerMonth} used`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan section */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
            <Zap className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Plan
            </h2>
            <p className="text-sm text-white/40">Your current subscription</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
          <div>
            <p className="text-sm font-medium text-white">{planName} plan</p>
            <p className="text-xs text-white/30">
              {analysesPerMonth === -1
                ? "Unlimited analyses per month"
                : `${analysesPerMonth} analyses per month`}
            </p>
          </div>
          {planName === "Free" && (
            <Link
              href="/#pricing"
              className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Change password section */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
            <Shield className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Security
            </h2>
            <p className="text-sm text-white/40">Update your password</p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(() => {
              void updatePassword();
            });
          }}
        >
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-sm font-medium text-white/60"
            >
              New password
            </label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
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
              htmlFor="confirm-new-password"
              className="text-sm font-medium text-white/60"
            >
              Confirm new password
            </label>
            <Input
              id="confirm-new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isPending || !newPassword || !confirmPassword}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>

          {message && (
            <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Sign out */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Sign out
            </h2>
            <p className="text-sm text-white/40">
              End your current session on this device.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              startTransition(() => {
                void signOut();
              });
            }}
            disabled={isPending}
            className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
