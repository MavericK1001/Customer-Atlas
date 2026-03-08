import { redirect } from "next/navigation";

type SignupAliasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupAliasPage({
  searchParams,
}: SignupAliasPageProps) {
  const resolved = (await searchParams) ?? {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string") {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    }
  }

  const target = params.toString()
    ? `/account/signup?${params.toString()}`
    : "/account/signup";

  redirect(target);
}
