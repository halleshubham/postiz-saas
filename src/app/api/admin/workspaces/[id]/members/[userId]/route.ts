import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth();
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, userId } = await params;
  await prisma.companyMember.deleteMany({ where: { companyId: id, userId } });
  return NextResponse.json({ message: "Member removed" });
}
