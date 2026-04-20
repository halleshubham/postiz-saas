import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPostizUser } from "@/lib/postiz-user-service";

const schema = z.object({ name: z.string().min(2).max(80) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name } = schema.parse(await req.json());
    const userId = session.user.id;
    const userEmail = session.user.email!;

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const slug = `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`;

    const company = await prisma.company.create({ data: { name, slug } });
    await prisma.companyMember.create({
      data: { companyId: company.id, userId, role: "OWNER" },
    });

    const tempPassword = crypto.randomBytes(16).toString("hex");
    try {
      await createPostizUser(userEmail, tempPassword, name);
    } catch (err) {
      console.error("[postiz-sync] Failed to create Postiz user:", err);
    }

    return NextResponse.json({ company }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    console.error("Create company error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
