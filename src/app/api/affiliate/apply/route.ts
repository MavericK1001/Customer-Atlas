import { NextRequest, NextResponse } from "next/server";
import { getAccountUserFromRequest } from "@/lib/account-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    contactName?: string;
    companyName?: string;
    websiteUrl?: string;
    audienceNotes?: string;
  };

  const accountUser = await getAccountUserFromRequest(request);

  const email = (body.email ?? accountUser?.email ?? "").trim().toLowerCase();
  const contactName = (body.contactName ?? accountUser?.name ?? "").trim();
  const companyName = (body.companyName ?? "").trim();
  const websiteUrl = (body.websiteUrl ?? "").trim();
  const audienceNotes = (body.audienceNotes ?? "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (!contactName || contactName.length < 2) {
    return NextResponse.json({ error: "Contact name is required." }, { status: 400 });
  }

  const existingPending = await prisma.affiliateApplication.findFirst({
    where: {
      email,
      status: "pending",
    },
    select: { id: true },
  });

  if (existingPending) {
    return NextResponse.json(
      { error: "An affiliate application is already pending for this email." },
      { status: 409 },
    );
  }

  const created = await prisma.affiliateApplication.create({
    data: {
      email,
      contactName,
      companyName: companyName || null,
      websiteUrl: websiteUrl || null,
      audienceNotes: audienceNotes || null,
      merchantUserId: accountUser?.id ?? null,
      status: "pending",
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    application: created,
  });
}
