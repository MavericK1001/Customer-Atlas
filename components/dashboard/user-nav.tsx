"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings, ChevronDown, Loader2 } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function UserNav({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function signOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/");
    router.refresh();
  }

  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/[0.08]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-semibold text-white">
          {initials}
        </div>
        <span className="hidden max-w-[140px] truncate text-sm text-white/70 sm:block">
          {email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-white/40" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-[#16161d] shadow-2xl">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{email}</p>
            <p className="text-xs text-white/30">Personal account</p>
          </div>

          <div className="p-1.5">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Account settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                startTransition(() => {
                  void signOut();
                });
              }}
              disabled={isPending}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
