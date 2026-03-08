import { redirect } from "next/navigation";

type LoginAliasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginAliasPage({
  searchParams,
}: LoginAliasPageProps) {
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
    ? `/account/login?${params.toString()}`
    : "/account/login";

  redirect(target);
}
