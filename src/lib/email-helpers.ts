import { prisma } from "./db";
import { sendEmail } from "./email";
import { generateToken } from "./auth-helpers";

export async function sendVerificationEmail(userId: string, email: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({ data: { token, userId, expiresAt } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/verify-email?token=${token}`;

  await sendEmail(
    email,
    "Verify your Shacky Social email",
    `Click this link to verify your email: ${link}`,
    `<p>Click <a href="${link}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
  );
}

export async function sendPasswordResetEmail(userId: string, email: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({ data: { token, userId, expiresAt } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/reset-password?token=${token}`;

  await sendEmail(
    email,
    "Reset your Shacky Social password",
    `Click this link to reset your password: ${link}`,
    `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p>`,
  );
}
