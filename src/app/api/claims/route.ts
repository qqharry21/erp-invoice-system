import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split("@")[0],
        },
      });
    }

    const body = await request.json();
    const { amount, purpose, status, attachments } = body;

    // Create claim with attachments
    const claim = await prisma.claim.create({
      data: {
        userId: dbUser.id,
        amount,
        purpose,
        status,
        submittedAt: status === "PENDING" ? new Date() : null,
        attachments: {
          create: attachments,
        },
      },
      include: {
        attachments: true,
      },
    });

    // Create approval history
    await prisma.approvalHistory.create({
      data: {
        claimId: claim.id,
        userId: dbUser.id,
        action: status === "DRAFT" ? "CREATED_DRAFT" : "SUBMITTED",
        toStatus: status,
        comment: `請款單已${status === "DRAFT" ? "建立" : "提交"}`,
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const claims = await prisma.claim.findMany({
      where: { userId: dbUser.id },
      include: {
        attachments: true,
        approvals: {
          include: {
            approver: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 },
    );
  }
}
