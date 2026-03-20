import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase";
import { getUserUsage } from "@/lib/usage";
import { AccountSettings } from "@/components/account/account-settings";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  const usage = await getUserUsage(user.id);

  return (
    <main className="section-shell py-10 sm:py-14">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
          Account
        </p>
        <h1 className="font-display text-4xl font-bold text-white">Settings</h1>
        <p className="text-base text-white/40">
          Manage your profile and account preferences.
        </p>
      </div>

      <AccountSettings
        email={user.email ?? ""}
        userId={user.id}
        createdAt={user.created_at}
        planName={usage.plan.planName}
        usedThisMonth={usage.usedThisMonth}
        analysesPerMonth={usage.plan.analysesPerMonth}
      />
    </main>
  );
}
