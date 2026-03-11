import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { createAffiliateApiKey } from "@/lib/services/affiliate-keys";
import { createAffiliateLink } from "@/lib/services/affiliate-links";
import { prisma } from "@/lib/prisma";

async function requireAdmin(request: NextRequest): Promise<
  | { ok: true; user: { id: number; email: string; role: string } }
  | { ok: false; response: NextResponse }
> {
  const user = await getAccountUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  if (user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { ok: true, user };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const status = request.nextUrl.searchParams.get("status") ?? "pending";

  const applications = await prisma.affiliateApplication.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      contactName: true,
      companyName: true,
      websiteUrl: true,
      audienceNotes: true,
      status: true,
      reviewerNotes: true,
      createdAt: true,
      reviewedAt: true,
      merchantUserId: true,
    },
  });

  return NextResponse.json({ ok: true, applications });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    applicationId?: number;
    status?: "approved" | "rejected";
    reviewerNotes?: string;
  };

  if (!body.applicationId || !body.status) {
    return NextResponse.json(
      { error: "applicationId and status are required." },
      { status: 400 },
    );
  }

  const application = await prisma.affiliateApplication.findUnique({
    where: { id: body.applicationId },
    select: {
      id: true,
      status: true,
      merchantUserId: true,
      email: true,
      contactName: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (application.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending applications can be reviewed." },
      { status: 409 },
    );
  }

  const reviewed = await prisma.affiliateApplication.update({
    where: { id: application.id },
    data: {
      status: body.status,
      reviewerNotes: body.reviewerNotes?.trim() || null,
      reviewedAt: new Date(),
      reviewedById: auth.user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (body.status === "approved" && application.merchantUserId) {
    const profile = await prisma.affiliateProfile.upsert({
      where: { merchantUserId: application.merchantUserId },
      update: {
        status: "active",
        approvedAt: new Date(),
      },
      create: {
        merchantUserId: application.merchantUserId,
        status: "active",
        approvedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    const defaultLink = await prisma.affiliateReferralLink.findFirst({
      where: {
        affiliateId: profile.id,
        isDefault: true,
      },
      select: { id: true },
    });

    if (!defaultLink) {
      await createAffiliateLink({
        affiliateId: profile.id,
        label: "Default Link",
        isDefault: true,
      });
    }

    const hasActiveKey = await prisma.affiliateApiKey.findFirst({
      where: {
        affiliateId: profile.id,
        revokedAt: null,
      },
      select: { id: true },
    });

    if (!hasActiveKey) {
      await createAffiliateApiKey({
        affiliateId: profile.id,
        name: "Initial API Key",
      });
    }
  }

  return NextResponse.json({ ok: true, application: reviewed });
}
