import { prisma } from "@/lib/prisma";

function randomCode(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < length; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function createAffiliateLink(input: {
  affiliateId: number;
  label?: string;
  isDefault?: boolean;
}): Promise<{ id: number; code: string; label: string | null; isDefault: boolean }> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomCode();
    try {
      const created = await prisma.affiliateReferralLink.create({
        data: {
          affiliateId: input.affiliateId,
          code,
          label: input.label?.trim() || null,
          isDefault: !!input.isDefault,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          label: true,
          isDefault: true,
        },
      });

      return created;
    } catch {
      // Retry unique code collisions.
    }
  }

  throw new Error("Unable to generate a unique referral code.");
}
