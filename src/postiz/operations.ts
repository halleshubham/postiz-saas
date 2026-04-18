import type { Company, CompanyMember } from "wasp/entities";
import { HttpError, prisma } from "wasp/server";
import type { CreateCompany, GetCompanyDashboard } from "wasp/server/operations";
import { z } from "zod";
import { createPostizUser } from "../postiz-db/postizUserService";

type CompanyRole = "OWNER" | "ADMIN" | "MEMBER";

type CompanyDashboard = {
  company: Company | null;
  membership: CompanyMember | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getMembership(userId: string) {
  return prisma.companyMember.findFirst({
    where: { userId },
    include: { company: true },
    orderBy: { createdAt: "asc" },
  });
}

export const getCompanyDashboard: GetCompanyDashboard<
  void,
  CompanyDashboard
> = async (_args, context) => {
  if (!context.user) throw new HttpError(401);

  const membership = await getMembership(context.user.id);

  return {
    company: membership?.company ?? null,
    membership: membership ?? null,
    subscriptionPlan: context.user.subscriptionPlan ?? null,
    subscriptionStatus: context.user.subscriptionStatus ?? null,
  };
};

const createCompanySchema = z.object({
  name: z.string().min(2).max(80),
});

export const createCompany: CreateCompany<
  z.infer<typeof createCompanySchema>,
  Company
> = async (rawArgs, context) => {
  if (!context.user) throw new HttpError(401);
  const input = createCompanySchema.parse(rawArgs);

  const existing = await getMembership(context.user.id);
  if (existing) throw new HttpError(409, "You already belong to a company.");

  const baseSlug = slugify(input.name);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  // Create user in Postiz database directly
  try {
    const email = context.user.email ?? "";
    // Generate a random password for the Postiz account — user logs in via the SaaS portal,
    // not directly into Postiz.
    const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    await createPostizUser(email, randomPassword, input.name);
  } catch (err) {
    console.error("Failed to create user in Postiz DB:", err);
  }

  return prisma.company.create({
    data: {
      name: input.name,
      slug,
      members: {
        create: {
          userId: context.user.id,
          role: "OWNER" satisfies CompanyRole,
        },
      },
    },
  });
};
