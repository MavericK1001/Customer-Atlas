import { NextRequest } from "next/server";
import { readAccountSessionToken } from "@/lib/account-session";
import { ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { prisma } from "@/lib/prisma";

export type AccountUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
};

export async function getAccountUserFromRequest(
  request: NextRequest,
): Promise<AccountUser | null> {
  const session = readAccountSessionToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE_NAME)?.value,
  );

  if (!session) {
    return null;
  }

  const user = await prisma.merchantUser.findUnique({
    where: { id: session.merchantUserId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}
